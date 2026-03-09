const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CorrectionRequest = sequelize.define('CorrectionRequest', {
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
    type: {
        type: DataTypes.ENUM('Forgot_CheckIn', 'Forgot_CheckOut', 'Wrong_Time', 'Work_Outside'),
        allowNull: false,
    },
    requested_check_in: {
        type: DataTypes.DATE,
    },
    requested_check_out: {
        type: DataTypes.DATE,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
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
    tableName: 'CorrectionRequests',
    updatedAt: false,
});

module.exports = CorrectionRequest;
