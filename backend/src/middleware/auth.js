const jwt = require('jsonwebtoken');
const { User } = require('../models');


const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user trong DB để đảm bảo user còn tồn tại và is_active
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc tài khoản bị khóa' });
        }

        req.user = user; 
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Middleware: Kiểm tra vai trò (role-based access)
// Sử dụng: requireRole('Admin', 'Manager')
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Bạn không có quyền truy cập. Yêu cầu vai trò: ${roles.join(' hoặc ')}` 
            });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
