const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(20),
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'Departments',
    timestamps: false,
});

module.exports = Department;
