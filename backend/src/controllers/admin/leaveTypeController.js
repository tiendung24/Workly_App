const { LeaveType } = require('../../models');

// GET /api/admin/leaves
const getLeaveTypes = async (req, res, next) => {
    try {
        const types = await LeaveType.findAll();
        const mappedTypes = types.map(t => ({
            ...t.toJSON(),
            default_days: t.days_allowed_per_year
        }));
        res.status(200).json({ data: mappedTypes });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/leaves
const createLeaveType = async (req, res, next) => {
    try {
        const { name, default_days, is_paid, description } = req.body;
        const type = await LeaveType.create({ name, days_allowed_per_year: default_days, is_paid, description });
        res.status(201).json({ message: 'Tạo loại phép thành công', data: type });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/leaves/:id
const updateLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, default_days, is_paid, description } = req.body;
        const type = await LeaveType.findByPk(id);
        if (!type) return res.status(404).json({ message: 'Không tìm thấy loại phép' });
        
        await type.update({ name, days_allowed_per_year: default_days, is_paid, description });
        res.status(200).json({ message: 'Cập nhật loại phép thành công', data: type });
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
