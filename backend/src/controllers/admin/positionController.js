const { Position } = require('../../models');
const { Op } = require('sequelize');

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
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Position name is required' });
        }
        const existing = await Position.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: 'Position name already exists' });
        }
        const position = await Position.create({ name: name.trim() });
        res.status(201).json({ message: 'Position created successfully', data: position });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/positions/:id
const updatePosition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Position name is required' });
        }
        const position = await Position.findByPk(id);
        if (!position) return res.status(404).json({ message: 'Position not found' });
        
        const duplicate = await Position.findOne({ where: { name: name.trim(), id: { [Op.ne]: id } } });
        if (duplicate) {
            return res.status(400).json({ message: 'Position name already exists' });
        }
        await position.update({ name: name.trim() });
        res.status(200).json({ message: 'Updated successfully', data: position });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/positions/:id
const deletePosition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const position = await Position.findByPk(id);
        if (!position) return res.status(404).json({ message: 'Position not found' });
        
        await position.destroy();
        res.status(200).json({ message: 'Position deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Cannot delete position with assigned employees' });
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
