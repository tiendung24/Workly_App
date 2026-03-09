const { OvertimeRequest } = require('../models');

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
        const { date, hours, reason } = req.body;

        if (!date || !hours) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày và số giờ tăng ca' });
        }

        const newRequest = await OvertimeRequest.create({
            user_id: userId,
            date,
            hours,
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
