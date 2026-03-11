const { OvertimeRequest } = require('../models');
const moment = require('moment');

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
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin ngày và giờ' });
        }

        // Calculate hours
        const t1 = moment(start_time, "HH:mm");
        const t2 = moment(end_time, "HH:mm");
        const total_hours = t2.diff(t1, 'hours', true);

        if (total_hours <= 0) {
            return res.status(400).json({ message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu' });
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

        res.status(201).json({
            message: 'Tạo đơn tăng ca thành công',
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
