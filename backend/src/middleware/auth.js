const jwt = require('jsonwebtoken');
const { User } = require('../models');


const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, please login' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user trong DB để đảm bảo user còn tồn tại và is_active
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({ message: 'Invalid token or account locked' });
        }

        req.user = user; 
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please login again' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware: Kiểm tra vai trò (role-based access)
// Sử dụng: requireRole('Admin', 'Manager')
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `You do not have access. Required role: ${roles.join(' or ')}` 
            });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
