const { WorkShift } = require('../../models');
const { notifyByRoles } = require('../../services/notificationService');

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
        res.status(201).json({ message: 'Shift created successfully', data: shift });
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
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        
        await shift.update({ name, start_time, end_time });

        // --- Notification: Ca làm việc thay đổi ---
        await notifyByRoles(
            ['Employee', 'Manager'],
            'Work shift updated',
            `Shift "${shift.name}" has been updated: ${start_time} - ${end_time}. Please check your schedule.`,
            'SHIFT_UPDATED',
            shift.id
        );

        res.status(200).json({ message: 'Updated successfully', data: shift });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/shifts/:id
const deleteShift = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shift = await WorkShift.findByPk(id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        
        await shift.destroy();
        res.status(200).json({ message: 'Shift deleted successfully' });
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
