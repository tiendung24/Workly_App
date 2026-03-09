const { CorrectionRequest } = require('../models');

// GET /api/correction/requests
const getRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const requests = await CorrectionRequest.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.status(200).json({ data: requests });
    } catch (error) {
        next(error);
    }
};

// POST /api/correction/request
const createRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, correction_type, correct_time, reason } = req.body;

        if (!date || !correction_type || !correct_time) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giải trình' });
        }

        const newRequest = await CorrectionRequest.create({
            user_id: userId,
            date,
            correction_type,
            correct_time,
            reason: reason || '',
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Tạo đơn giải trình thành công',
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
