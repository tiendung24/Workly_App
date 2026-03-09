const { User, Department, Position } = require('../../models');
const bcrypt = require('bcryptjs');

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
        const { employee_code, full_name, email, password, phone, address, department_id, position_id, role, manager_id, start_date } = req.body;
        
        // Check if email or employee_code exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });
        
        const existingCode = await User.findOne({ where: { employee_code } });
        if (existingCode) return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password || '123456', salt); // Default pass

        const user = await User.create({
            employee_code,
            full_name,
            email,
            password_hash,
            phone,
            address,
            department_id: department_id || null,
            position_id: position_id || null,
            role: role || 'Employee',
            manager_id: manager_id || null,
            start_date: start_date || new Date(),
        });

        // Don't return hash
        const userData = user.toJSON();
        delete userData.password_hash;

        res.status(201).json({ message: 'Tạo tài khoản thành công', data: userData });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, phone, address, department_id, position_id, role, manager_id, is_active } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        await user.update({
            full_name,
            phone,
            address,
            department_id: department_id || null,
            position_id: position_id || null,
            role,
            manager_id: manager_id || null,
            is_active
        });

        const userData = user.toJSON();
        delete userData.password_hash;

        res.status(200).json({ message: 'Cập nhật thành công', data: userData });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        
        // Hard delete or soft logic? Let's just lock it (soft delete via active status) for safety
        await user.update({ is_active: false });
        res.status(200).json({ message: 'Tài khoản đã được vô hiệu hoá' });
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
