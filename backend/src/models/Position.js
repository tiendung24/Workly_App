const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Position = sequelize.define('Position', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    base_salary: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    }
}, {
    tableName: 'Positions',
    timestamps: false,
});

module.exports = Position;
