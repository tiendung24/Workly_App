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
        res.status(201).json({ message: 'Tạo phòng ban thành công', data: department });
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
        if (!department) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
        
        await department.update({ name, description });
        res.status(200).json({ message: 'Cập nhật thành công', data: department });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const department = await Department.findByPk(id);
        if (!department) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
        
        await department.destroy();
        res.status(200).json({ message: 'Xoá phòng ban thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
