const { User, Department, Position } = require('../models');

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
        const { phone, address, avatar_url } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (avatar_url !== undefined) user.avatar_url = avatar_url;

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

module.exports = {
    getProfile,
    updateProfile
};
