const { CorrectionRequest, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { createAndEmit } = require('../services/notificationService');

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
            return res.status(400).json({ message: 'Please provide all correction details' });
        }

        const today = moment().format('YYYY-MM-DD');

        // 1. Correction chỉ cho sửa ngày quá khứ
        if (!moment(date, 'YYYY-MM-DD').isBefore(today)) {
            return res.status(400).json({ message: 'Correction requests can only be made for past dates' });
        }

        // 2. Không cho trùng đơn Correction cùng ngày (Pending/Approved)
        const duplicate = await CorrectionRequest.findOne({
            where: {
                user_id: userId,
                date: date,
                status: { [Op.in]: ['Pending', 'Approved'] }
            }
        });
        if (duplicate) {
            return res.status(400).json({ message: 'You already have a correction request for this date' });
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

        // --- Notification Logic ---
        const currentUser = await User.findByPk(userId);
        if (currentUser && currentUser.manager_id) {
            await createAndEmit(
                currentUser.manager_id,
                'New attendance correction request',
                `Employee ${currentUser.full_name} has submitted a correction request.`,
                'CORRECTION_REQUEST',
                newRequest.id
            );
        }

        res.status(201).json({
            message: 'Correction request created successfully',
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
