const { Position } = require('../../models');

// GET /api/admin/positions
const getPositions = async (req, res, next) => {
    try {
        const positions = await Position.findAll();
        res.status(200).json({ data: positions });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/positions
const createPosition = async (req, res, next) => {
    try {
        const { name } = req.body;
        const position = await Position.create({ name });
        res.status(201).json({ message: 'Tạo chức vụ thành công', data: position });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/positions/:id
const updatePosition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const position = await Position.findByPk(id);
        if (!position) return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
        
        await position.update({ name });
        res.status(200).json({ message: 'Cập nhật thành công', data: position });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/positions/:id
const deletePosition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const position = await Position.findByPk(id);
        if (!position) return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
        
        await position.destroy();
        res.status(200).json({ message: 'Xoá chức vụ thành công' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Không thể xoá vì đang có nhân sự mang chức vụ này' });
        }
        next(error);
    }
};

module.exports = {
    getPositions,
    createPosition,
    updatePosition,
    deletePosition
};
