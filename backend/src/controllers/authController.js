const jwt = require('jsonwebtoken');
const { User, Department, Position } = require('../models');

// Tạo JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { employee_code, full_name, email, password, phone, address, department_name, position_name, start_date } = req.body;

        // Validate input
        if (!employee_code || !full_name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ: mã NV, họ tên, email, mật khẩu' });
        }

        // Kiểm tra email đã tồn tại
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Kiểm tra mã nhân viên đã tồn tại
        const existingCode = await User.findOne({ where: { employee_code } });
        if (existingCode) {
            return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });
        }

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

        // Tạo user (password sẽ tự hash nhờ hook beforeCreate)
        const user = await User.create({
            employee_code,
            full_name,
            email,
            password_hash: password, // Hook beforeCreate sẽ hash
            phone,
            address,
            department_id: finalDepartmentId,
            position_id: finalPositionId,
            start_date: start_date ? new Date(start_date) : new Date(),
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("Registration Error:", error);
        next(error);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        // Tìm user kèm thông tin phòng ban & chức vụ
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Position, as: 'position', attributes: ['id', 'name'] },
            ],
        });

        if (!user) {
            return res.status(401).json({ message: 'Email không tồn tại' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa, liên hệ Admin' });
        }

        // So sánh mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me (cần verifyToken)
const getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Position, as: 'position', attributes: ['id', 'name'] },
                { model: User, as: 'manager', attributes: ['id', 'full_name', 'email'] },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        res.status(200).json({ user: user.toJSON() });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe };