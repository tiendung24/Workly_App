const { LeaveType } = require('../../models');

// GET /api/admin/leaves
const getLeaveTypes = async (req, res, next) => {
    try {
        const types = await LeaveType.findAll();
        res.status(200).json({ data: types });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/leaves
const createLeaveType = async (req, res, next) => {
    try {
        const { name, days_allowed_per_year, is_paid } = req.body;
        const type = await LeaveType.create({ name, days_allowed_per_year, is_paid });
        res.status(201).json({ message: 'Tạo loại phép thành công', data: type });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/leaves/:id
const updateLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, days_allowed_per_year, is_paid } = req.body;
        const type = await LeaveType.findByPk(id);
        if (!type) return res.status(404).json({ message: 'Không tìm thấy loại phép' });
        
        await type.update({ name, days_allowed_per_year, is_paid });
        res.status(200).json({ message: 'Cập nhật chức vụ thành công', data: type });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/leaves/:id
const deleteLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const type = await LeaveType.findByPk(id);
        if (!type) return res.status(404).json({ message: 'Không tìm thấy loại phép' });
        
        await type.destroy();
        res.status(200).json({ message: 'Xoá loại phép thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType
};
