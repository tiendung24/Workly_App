const { Department } = require('../../models');

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
        const department = await Department.create({ name, description });
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
        const department = await Department.findByPk(id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        
        await department.update({ name, description });
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
