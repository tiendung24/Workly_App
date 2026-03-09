const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OvertimeRequest = sequelize.define('OvertimeRequest', {
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    total_hours: {
        type: DataTypes.FLOAT,
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
}, {
    tableName: 'OvertimeRequests',
    updatedAt: false,
});

module.exports = OvertimeRequest;
