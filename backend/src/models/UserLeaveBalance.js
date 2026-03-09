const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserLeaveBalance = sequelize.define('UserLeaveBalance', {
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
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    used_days: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    remaining_days: {
        type: DataTypes.FLOAT,
        // Virtual field – tính tự động, không lưu DB (DB đã có GENERATED ALWAYS)
    },
}, {
    tableName: 'UserLeaveBalances',
    timestamps: false,
});

module.exports = UserLeaveBalance;
