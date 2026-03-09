const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LeaveRequest = sequelize.define('LeaveRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'LeaveTypes', key: 'id' },
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    reason: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending',
    },
    approver_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
    },
    rejection_reason: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'LeaveRequests',
    updatedAt: false, // Bảng gốc chỉ có created_at
});

module.exports = LeaveRequest;
