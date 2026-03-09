const { User, LeaveRequest, OvertimeRequest, CorrectionRequest, LeaveType } = require('../models');

// GET /api/manager/requests
const getTeamRequests = async (req, res, next) => {
    try {
        const managerId = req.user.id; // manager

        // Fetch leave requests for users managed by this manager
        const leaveRequests = await LeaveRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    where: { manager_id: managerId },
                    attributes: ['id', 'full_name', 'employee_code', 'avatar_url']
                },
                { model: LeaveType, as: 'leaveType' }
            ],
            order: [['created_at', 'DESC']]
        });

        // Fetch overtime requests
        const otRequests = await OvertimeRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    where: { manager_id: managerId },
                    attributes: ['id', 'full_name', 'employee_code', 'avatar_url']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Fetch correction requests
        const correctionRequests = await CorrectionRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    where: { manager_id: managerId },
                    attributes: ['id', 'full_name', 'employee_code', 'avatar_url']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Combine and map them
        const data = {
            leave: leaveRequests.map(item => ({ ...item.toJSON(), requestType: 'leave' })),
            overtime: otRequests.map(item => ({ ...item.toJSON(), requestType: 'overtime' })),
            correction: correctionRequests.map(item => ({ ...item.toJSON(), requestType: 'correction' }))
        };

        res.status(200).json({ data });

    } catch (error) {
        next(error);
    }
};

// PATCH /api/manager/approve/:type/:id
const updateRequestStatus = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { type, id } = req.params;
        const { status } = req.body; // 'Approved' | 'Rejected'
        
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Approved or Rejected' });
        }

        let modelClass;
        if (type === 'leave') modelClass = LeaveRequest;
        else if (type === 'overtime') modelClass = OvertimeRequest;
        else if (type === 'correction') modelClass = CorrectionRequest;
        else return res.status(400).json({ message: 'Invalid request type' });

        const item = await modelClass.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!item) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        // Ensure the manager approving is actually the user's manager
        if (item.user.manager_id !== managerId) {
            return res.status(403).json({ message: 'Không có quyền duyệt đơn này' });
        }

        item.status = status;
        item.approver_id = managerId;
        await item.save();

        res.status(200).json({ message: `Đơn đã được ${status.toLowerCase()}`, data: item });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTeamRequests,
    updateRequestStatus
};
