const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'Workly',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectOptions: process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud') ? {
            ssl: {
                require: true,
                rejectUnauthorized: true
            }
        } : {},
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: true,
            timestamps: true,
        },
    }
);

module.exports = sequelize;