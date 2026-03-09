const { LeaveRequest, LeaveType, UserLeaveBalance } = require('../models');

// GET /api/leave/balance
const getBalance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Find user's leave balance in the current year
        const currentYear = new Date().getFullYear();
        const balance = await UserLeaveBalance.findOne({
            where: { user_id: userId, year: currentYear }
        });

        if (!balance) {
            // Mặc định trả về 0 nếu chưa có cấu hình
            return res.status(200).json({
                message: 'Chưa có thông tin phép năm nay',
                data: { total_days: 0, used_days: 0, remaining_days: 0 }
            });
        }

        res.status(200).json({
            message: 'Thành công',
            data: balance
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
            message: 'Thành công',
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
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }

        const newRequest = await LeaveRequest.create({
            user_id: userId,
            leave_type_id,
            start_date,
            end_date,
            reason: reason || '',
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Tạo đơn xin nghỉ thành công',
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
