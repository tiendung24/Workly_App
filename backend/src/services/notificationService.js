const { Notification, User } = require('../models');
const { emitNotification } = require('./socketService');
const { Op } = require('sequelize');

/**
 * Tạo notification trong DB và emit qua socket cho 1 user
 */
const createAndEmit = async (userId, title, message, type, relatedId = null) => {
    try {
        const notification = await Notification.create({
            user_id: userId,
            title,
            message,
            type,
            related_id: relatedId
        });
        emitNotification(userId, notification);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

/**
 * Gửi notification cho tất cả user có role cụ thể (hoặc nhiều role)
 * @param {string|string[]} roles - 'Employee', 'Manager', ['Employee', 'Manager']
 * @param {string} title
 * @param {string} message
 * @param {string} type
 * @param {number|null} relatedId
 * @param {number|null} excludeUserId - Loại trừ user này (vd: admin đang thực hiện)
 */
const notifyByRoles = async (roles, title, message, type, relatedId = null, excludeUserId = null) => {
    try {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        
        const whereClause = {
            role: { [Op.in]: roleArray },
            is_active: true
        };
        
        if (excludeUserId) {
            whereClause.id = { [Op.ne]: excludeUserId };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id']
        });

        const promises = users.map(user => 
            createAndEmit(user.id, title, message, type, relatedId)
        );

        await Promise.all(promises);
    } catch (error) {
        console.error('Error broadcasting notifications:', error);
    }
};

module.exports = {
    createAndEmit,
    notifyByRoles,
};
