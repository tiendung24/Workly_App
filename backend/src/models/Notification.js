const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g., LEAVE_REQUEST, OVERTIME_REQUEST, CORRECTION_REQUEST, SYSTEM',
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    related_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID of the related entity (e.g., leaveRequestId)',
    },
}, {
    tableName: 'Notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Notification;
