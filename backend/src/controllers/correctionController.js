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
        const { date, type, requested_check_in, requested_check_out, reason } = req.body;

        if (!date || !type || (!requested_check_in && !requested_check_out)) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giải trình' });
        }

        let checkInDateTime = null;
        let checkOutDateTime = null;

        if (requested_check_in) {
            checkInDateTime = new Date(`${date}T${requested_check_in}:00`);
        }
        if (requested_check_out) {
            checkOutDateTime = new Date(`${date}T${requested_check_out}:00`);
        }

        const newRequest = await CorrectionRequest.create({
            user_id: userId,
            date,
            type,
            requested_check_in: checkInDateTime,
            requested_check_out: checkOutDateTime,
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
