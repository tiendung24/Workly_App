const { User, Department, Position } = require('../models');
const { Op } = require('sequelize');

// GET /api/profile/me
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, {
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Position, as: 'position', attributes: ['name'] },
                { model: User, as: 'manager', attributes: ['full_name'] }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Thành công',
            data: user
        });

    } catch (error) {
        next(error);
    }
};

// PUT /api/profile/me
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { 
            phone, address, avatar_url, 
            full_name, employee_code, email, start_date, 
            department_name, position_name 
        } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Email uniqueness check
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
            if (existingEmail) return res.status(400).json({ message: 'Email đã được sử dụng' });
            user.email = email;
        }

        // Employee code uniqueness check
        if (employee_code && employee_code !== user.employee_code) {
            const existingCode = await User.findOne({ where: { employee_code, id: { [Op.ne]: userId } } });
            if (existingCode) return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });
            user.employee_code = employee_code;
        }

        // Department
        if (department_name && department_name.trim() !== "") {
            const [dept] = await Department.findOrCreate({
                where: { name: department_name.trim() },
                defaults: { name: department_name.trim() }
            });
            user.department_id = dept.id;
        }

        // Position
        if (position_name && position_name.trim() !== "") {
            const [pos] = await Position.findOrCreate({
                where: { name: position_name.trim() },
                defaults: { name: position_name.trim() }
            });
            user.position_id = pos.id;
        }

        // Update fields if provided
        if (full_name !== undefined) user.full_name = full_name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (avatar_url !== undefined) user.avatar_url = avatar_url;
        if (start_date !== undefined) {
            // convert DD/MM/YYYY or YYYY-MM-DD to Date
            const dateStr = start_date.includes("/") ? start_date.split("/").reverse().join("-") : start_date;
            user.start_date = new Date(dateStr);
        }

        await user.save();

        res.status(200).json({
            message: 'Cập nhật thành công',
            data: {
                id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                address: user.address,
                avatar_url: user.avatar_url
            }
        });

    } catch (error) {
        next(error);
    }
};

// PUT /api/profile/password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        user.password_hash = newPassword; // Hook will secure it
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
