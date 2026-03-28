const { Department } = require('../../models');
const { Op } = require('sequelize');

// GET /api/admin/departments
const getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.findAll();
        res.status(200).json({ data: departments });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/departments
const createDepartment = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }
        const existing = await Department.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: 'Department name already exists' });
        }
        const department = await Department.create({ name: name.trim(), description });
        res.status(201).json({ message: 'Department created successfully', data: department });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/departments/:id
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }
        const department = await Department.findByPk(id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        
        const duplicate = await Department.findOne({ where: { name: name.trim(), id: { [Op.ne]: id } } });
        if (duplicate) {
            return res.status(400).json({ message: 'Department name already exists' });
        }
        await department.update({ name: name.trim(), description });
        res.status(200).json({ message: 'Updated successfully', data: department });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const department = await Department.findByPk(id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        
        await department.destroy();
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Cannot delete department with assigned employees' });
        }
        next(error);
    }
};

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
