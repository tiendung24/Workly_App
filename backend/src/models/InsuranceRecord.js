const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InsuranceRecord = sequelize.define('InsuranceRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    monthly_fee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    old_debt: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('Unpaid', 'Paid'),
        defaultValue: 'Unpaid',
    }
}, {
    tableName: 'InsuranceRecords',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'month', 'year']
        }
    ]
});

module.exports = InsuranceRecord;
