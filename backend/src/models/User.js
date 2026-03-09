const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employee_code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(20),
    },
    address: {
        type: DataTypes.TEXT,
    },
    avatar_url: {
        type: DataTypes.STRING(255),
    },
    department_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Departments', key: 'id' },
    },
    position_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Positions', key: 'id' },
    },
    manager_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Manager', 'Employee'),
        defaultValue: 'Employee',
    },
    start_date: {
        type: DataTypes.DATEONLY,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'Users',
    hooks: {
        // Tự động hash password trước khi tạo user
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        // Tự động hash password trước khi cập nhật (nếu thay đổi)
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
    },
});

// Instance method: so sánh password
User.prototype.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password_hash);
};

// Ẩn password khi serialize JSON
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
};

module.exports = User;
