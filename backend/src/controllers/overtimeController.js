const { OvertimeRequest, User, WorkShift } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { createAndEmit } = require('../services/notificationService');

// GET /api/overtime/requests
const getRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const requests = await OvertimeRequest.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.status(200).json({ data: requests });
    } catch (error) {
        next(error);
    }
};

// POST /api/overtime/request
const createRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, start_time, end_time, reason } = req.body;

        if (!date || !start_time || !end_time) {
            return res.status(400).json({ message: 'Please provide all date and time details' });
        }

        const today = moment().format('YYYY-MM-DD');

        // 1. Không cho chọn ngày quá khứ
        if (moment(date, 'YYYY-MM-DD').isBefore(today)) {
            return res.status(400).json({ message: 'Cannot register overtime for past dates' });
        }

        // Calculate hours
        const t1 = moment(start_time, "HH:mm");
        const t2 = moment(end_time, "HH:mm");
        const total_hours = t2.diff(t1, 'hours', true);

        if (total_hours <= 0) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // 2. OT phải ngoài giờ hành chính (sau giờ kết thúc ca)
        const shift = await WorkShift.findOne();
        if (shift) {
            const shiftEnd = moment(shift.end_time, 'HH:mm:ss');
            const otStart = moment(start_time, 'HH:mm');
            if (otStart.isBefore(shiftEnd)) {
                return res.status(400).json({ 
                    message: `Overtime must start after office hours (${shift.end_time}). Your start time: ${start_time}` 
                });
            }
        }

        // 3. Không cho trùng đơn OT cùng ngày (Pending/Approved)
        const duplicate = await OvertimeRequest.findOne({
            where: {
                user_id: userId,
                date: date,
                status: { [Op.in]: ['Pending', 'Approved'] }
            }
        });
        if (duplicate) {
            return res.status(400).json({ message: 'You already have an overtime request for this date' });
        }

        const newRequest = await OvertimeRequest.create({
            user_id: userId,
            date,
            start_time,
            end_time,
            total_hours,
            reason: reason || '',
            status: 'Pending'
        });

        // --- Notification Logic ---
        const currentUser = await User.findByPk(userId);
        if (currentUser && currentUser.manager_id) {
            await createAndEmit(
                currentUser.manager_id,
                'New overtime request',
                `Employee ${currentUser.full_name} has submitted an overtime request.`,
                'OVERTIME_REQUEST',
                newRequest.id
            );
        }

        res.status(201).json({
            message: 'Overtime request created successfully',
            data: newRequest
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRequests,
    createRequest
};
