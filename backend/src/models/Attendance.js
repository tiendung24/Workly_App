const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
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
    check_in_time: {
        type: DataTypes.DATE,
    },
    check_out_time: {
        type: DataTypes.DATE,
    },
    work_shift_id: {
        type: DataTypes.INTEGER,
        references: { model: 'WorkShifts', key: 'id' },
    },
    status: {
        type: DataTypes.ENUM('Present', 'Late', 'EarlyLeave', 'Absent', 'Off'),
        defaultValue: 'Absent',
    },
    note: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'Attendance',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'date'],
        },
    ],
});

module.exports = Attendance;
