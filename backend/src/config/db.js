// src/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Đọc file .env

// Tạo hồ chứa kết nối (Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '', // Điền pass của bạn vào .env nhé
    database: process.env.DB_NAME || 'workly_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển sang dạng Promise để dùng async/await cho gọn
const db = pool.promise();

module.exports = db;