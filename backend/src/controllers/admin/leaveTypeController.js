const { LeaveType } = require('../../models');
const { notifyByRoles } = require('../../services/notificationService');

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
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Leave type name is required' });
        }
        const type = await LeaveType.create({ name: name.trim(), days_allowed_per_year: default_days, is_paid, description });

        // --- Notification: Loại phép mới ---
        await notifyByRoles(
            ['Employee', 'Manager'],
            'New leave type added',
            `System added a new leave type: "${name}" (${default_days || 0} days/year). Check details in Leave section.`,
            'LEAVE_TYPE_CREATED',
            type.id
        );

        res.status(201).json({ message: 'Leave type created successfully', data: type });
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
        if (!type) return res.status(404).json({ message: 'Leave type not found' });
        
        await type.update({ name, days_allowed_per_year: default_days, is_paid, description });
        res.status(200).json({ message: 'Leave type updated successfully', data: type });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/leaves/:id
const deleteLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const type = await LeaveType.findByPk(id);
        if (!type) return res.status(404).json({ message: 'Leave type not found' });
        
        await type.destroy();
        res.status(200).json({ message: 'Leave type deleted successfully' });
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
