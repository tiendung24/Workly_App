const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payroll = sequelize.define('Payroll', {
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
    month: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    base_salary: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    standard_working_days: {
        type: DataTypes.DECIMAL(5, 1),
        defaultValue: 22, // usually 22 or 26
    },
    actual_working_days: {
        type: DataTypes.DECIMAL(5, 1),
        defaultValue: 0,
    },
    overtime_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
    },
    overtime_pay: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    allowances: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    deductions: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    net_salary: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Published'),
        defaultValue: 'Published', // Imported or Generated
    },
}, {
    tableName: 'Payrolls',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'month', 'year']
        }
    ]
});

module.exports = Payroll;
