const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WorkShift = sequelize.define('WorkShift', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
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
}, {
    tableName: 'WorkShifts',
});

module.exports = WorkShift;
