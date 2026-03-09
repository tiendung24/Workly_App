const { WorkShift } = require('../../models');

// GET /api/admin/shifts
const getShifts = async (req, res, next) => {
    try {
        const shifts = await WorkShift.findAll();
        res.status(200).json({ data: shifts });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/shifts
const createShift = async (req, res, next) => {
    try {
        const { name, start_time, end_time } = req.body;
        const shift = await WorkShift.create({ name, start_time, end_time });
        res.status(201).json({ message: 'Tạo ca làm việc thành công', data: shift });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/shifts/:id
const updateShift = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, start_time, end_time } = req.body;
        const shift = await WorkShift.findByPk(id);
        if (!shift) return res.status(404).json({ message: 'Không tìm thấy ca làm việc' });
        
        await shift.update({ name, start_time, end_time });
        res.status(200).json({ message: 'Cập nhật thành công', data: shift });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/shifts/:id
const deleteShift = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shift = await WorkShift.findByPk(id);
        if (!shift) return res.status(404).json({ message: 'Không tìm thấy ca làm việc' });
        
        await shift.destroy();
        res.status(200).json({ message: 'Xoá ca làm việc thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getShifts,
    createShift,
    updateShift,
    deleteShift
};
