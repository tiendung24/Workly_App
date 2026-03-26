const { User, Department, Position } = require('../../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { createAndEmit } = require('../../services/notificationService');

// GET /api/admin/users
const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Department, as: 'department' },
                { model: Position, as: 'position' },
                { model: User, as: 'manager', attributes: ['id', 'full_name'] }
            ]
        });
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/users
const createUser = async (req, res, next) => {
    try {
        const { employee_code, full_name, email, password, phone, address, department_name, position_name, role, manager_id, start_date } = req.body;
        
        // Check if email or employee_code exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });
        
        const existingCode = await User.findOne({ where: { employee_code } });
        if (existingCode) return res.status(400).json({ message: 'Employee code already exists' });

        // Xử lý Department bằng chữ
        let finalDepartmentId = null;
        if (department_name && department_name.trim() !== "") {
            const [dept] = await Department.findOrCreate({
                where: { name: department_name.trim() },
                defaults: { name: department_name.trim() }
            });
            finalDepartmentId = dept.id;
        }

        // Xử lý Position bằng chữ
        let finalPositionId = null;
        if (position_name && position_name.trim() !== "") {
            const [pos] = await Position.findOrCreate({
                where: { name: position_name.trim() },
                defaults: { name: position_name.trim() }
            });
            finalPositionId = pos.id;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password || '123456', salt); // Default pass

        const user = await User.create({
            employee_code,
            full_name,
            email,
            password_hash,
            phone,
            address,
            department_id: finalDepartmentId,
            position_id: finalPositionId,
            role: role || 'Employee',
            manager_id: manager_id || null,
            start_date: start_date || new Date(),
        });

        // Don't return hash
        const userData = user.toJSON();
        delete userData.password_hash;

        // --- Notification: Chào mừng nhân viên mới ---
        await createAndEmit(
            user.id,
            'Welcome to Workly!',
            `Your account has been created. ID: ${employee_code}. Welcome aboard!`,
            'ACCOUNT_CREATED',
            user.id
        );

        res.status(201).json({ message: 'User created successfully', data: userData });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, phone, address, department_name, position_name, role, manager_id, is_active, employee_code, email } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Xử lý Department bằng chữ
        let finalDepartmentId = user.department_id;
        if (department_name && department_name.trim() !== "") {
            const [dept] = await Department.findOrCreate({
                where: { name: department_name.trim() },
                defaults: { name: department_name.trim() }
            });
            finalDepartmentId = dept.id;
        }

        // Xử lý Position bằng chữ
        let finalPositionId = user.position_id;
        if (position_name && position_name.trim() !== "") {
            const [pos] = await Position.findOrCreate({
                where: { name: position_name.trim() },
                defaults: { name: position_name.trim() }
            });
            finalPositionId = pos.id;
        }

        // Employee code uniqueness check
        if (employee_code && employee_code !== user.employee_code) {
            const existingCode = await User.findOne({ where: { employee_code, id: { [Op.ne]: id } } });
            if (existingCode) return res.status(400).json({ message: 'Employee code already exists' });
            user.employee_code = employee_code;
        }

        // Email uniqueness check
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
            if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
            user.email = email;
        }

        await user.update({
            employee_code: user.employee_code,
            email: user.email,
            full_name,
            phone,
            address,
            department_id: finalDepartmentId,
            position_id: finalPositionId,
            role,
            manager_id: manager_id || null,
            is_active
        });

        const userData = user.toJSON();
        delete userData.password_hash;

        // --- Notification: Thông báo cập nhật thông tin ---
        await createAndEmit(
            user.id,
            'Account details updated',
            'An administrator has updated your account information. Please review your profile.',
            'ACCOUNT_UPDATED',
            user.id
        );

        res.status(200).json({ message: 'Update successful', data: userData });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Remove user from the database entirely
        await user.destroy();

        res.status(200).json({ message: 'Employee has been permanently deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
