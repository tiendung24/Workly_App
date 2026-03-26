const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transaction_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    insurance_record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Success', 'Failed'),
        defaultValue: 'Pending',
    },
    payos_webhook_data: {
        type: DataTypes.JSON,
    },
    transaction_time: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'Transactions',
    timestamps: true,
    updatedAt: false,
});

module.exports = Transaction;
