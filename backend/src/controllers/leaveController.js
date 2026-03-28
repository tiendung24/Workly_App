const { LeaveRequest, LeaveType, UserLeaveBalance, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { createAndEmit } = require('../services/notificationService');

// GET /api/leave/balance
const getBalance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const currentYear = new Date().getFullYear();
        
        // 1. Lấy thông tin quỹ phép của user từ DB
        let balance = await UserLeaveBalance.findOne({
            where: { user_id: userId, year: currentYear },
            include: [{ model: LeaveType, as: 'leaveType' }]
        });

        // 2. Nếu chưa có, tự động cấp phát dựa trên cấu hình LeaveType
        if (!balance) {
            const leaveType = await LeaveType.findOne({
                where: { name: 'Monthly Leave' }
            });

            if (leaveType) {
                balance = await UserLeaveBalance.create({
                    user_id: userId,
                    leave_type_id: leaveType.id,
                    year: currentYear,
                    total_days: leaveType.default_days || 12,
                    used_days: 0
                });
                
                // Fetch again to include the leftType data natively or just return created
                balance = await UserLeaveBalance.findOne({
                    where: { id: balance.id },
                    include: [{ model: LeaveType, as: 'leaveType' }]
                });
            } else {
                return res.status(200).json({
                    message: 'Leave configuration not found',
                    data: { total_days: 0, used_days: 0, remaining_days: 0 }
                });
            }
        }

        res.status(200).json({
            message: 'Success',
            data: {
               total_days: balance.total_days,
               used_days: balance.used_days,
               remaining_days: balance.total_days - balance.used_days
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/leave/requests
const getRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const requests = await LeaveRequest.findAll({
            where: { user_id: userId },
            include: [{ model: LeaveType, as: 'leaveType' }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Success',
            data: requests
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/leave/request
const createRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { leave_type_id, start_date, end_date, reason } = req.body;

        if (!leave_type_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'Please provide all details' });
        }

        const today = moment().format('YYYY-MM-DD');
        const startMoment = moment(start_date, 'YYYY-MM-DD');
        const endMoment = moment(end_date, 'YYYY-MM-DD');

        // 1. Không cho chọn ngày quá khứ
        if (startMoment.isBefore(today)) {
            return res.status(400).json({ message: 'Cannot request leave for past dates' });
        }

        // 2. end_date phải >= start_date
        if (endMoment.isBefore(startMoment)) {
            return res.status(400).json({ message: 'End date must be on or after start date' });
        }

        // 3. Check số ngày phép còn lại
        const requestedDays = endMoment.diff(startMoment, 'days') + 1;
        const currentYear = new Date().getFullYear();
        const balance = await UserLeaveBalance.findOne({
            where: { user_id: userId, year: currentYear }
        });
        if (balance) {
            const remaining = balance.total_days - balance.used_days;
            if (requestedDays > remaining) {
                return res.status(400).json({ 
                    message: `Insufficient leave balance. Remaining: ${remaining} days, Requested: ${requestedDays} days` 
                });
            }
        }

        // 4. Không cho trùng đơn (Pending/Approved) trùng khoảng ngày
        const overlapping = await LeaveRequest.findOne({
            where: {
                user_id: userId,
                status: { [Op.in]: ['Pending', 'Approved'] },
                start_date: { [Op.lte]: end_date },
                end_date: { [Op.gte]: start_date }
            }
        });
        if (overlapping) {
            return res.status(400).json({ message: 'You already have a leave request overlapping these dates' });
        }

        const newRequest = await LeaveRequest.create({
            user_id: userId,
            leave_type_id,
            start_date,
            end_date,
            reason: reason || '',
            status: 'Pending'
        });

        // --- Notification Logic ---
        const currentUser = await User.findByPk(userId);
        if (currentUser && currentUser.manager_id) {
            await createAndEmit(
                currentUser.manager_id,
                'New leave request',
                `Employee ${currentUser.full_name} has submitted a leave request.`,
                'LEAVE_REQUEST',
                newRequest.id
            );
        }

        res.status(201).json({
            message: 'Leave request created successfully',
            data: newRequest
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/leave/types (Helper for dropdowns)
const getLeaveTypes = async (req, res, next) => {
    try {
         const types = await LeaveType.findAll();
         res.status(200).json({ data: types });
    } catch (error) {
         next(error);
    }
}

module.exports = {
    getBalance,
    getRequests,
    createRequest,
    getLeaveTypes
};
