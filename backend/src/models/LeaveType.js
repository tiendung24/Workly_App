const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LeaveType = sequelize.define('LeaveType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    days_allowed_per_year: {
        type: DataTypes.INTEGER,
        defaultValue: 12,
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'LeaveTypes',
    timestamps: false,
});

module.exports = LeaveType;
