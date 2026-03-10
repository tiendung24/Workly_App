const { User, LeaveRequest, OvertimeRequest, CorrectionRequest, LeaveType, UserLeaveBalance, Department, Position, Attendance } = require('../models');
const moment = require('moment');

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

        // Process specific hook for Leave Approval
        if (modelClass === LeaveRequest && status === 'Approved') {
             // Lấy chi tiết phép
             const leaveDetail = await LeaveRequest.findByPk(id, { include: [{ model: LeaveType, as: 'leaveType' }] });
             if (leaveDetail && leaveDetail.leaveType && leaveDetail.leaveType.name.includes('Phép Năm')) {
                  const start = moment(leaveDetail.start_date);
                  const end = moment(leaveDetail.end_date);
                  const diffDays = end.diff(start, 'days') + 1;

                  const currentYear = new Date().getFullYear();
                  const balance = await UserLeaveBalance.findOne({
                      where: { user_id: item.user_id, leave_type_id: leaveDetail.leave_type_id, year: currentYear }
                  });
                  
                  if (balance) {
                      balance.used_days += diffDays;
                      await balance.save();
                  }
             }
        }

        item.status = status;
        item.approver_id = managerId;
        await item.save();

        res.status(200).json({ message: `Đơn đã được ${status.toLowerCase()}`, data: item });

    } catch (error) {
        next(error);
    }
};

// GET /api/manager/team
const getTeamMembers = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const members = await User.findAll({
            where: { manager_id: managerId },
            attributes: ['id', 'employee_code', 'full_name', 'email', 'phone', 'avatar_url', 'is_active'],
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Position, as: 'position', attributes: ['name'] }
            ]
        });
        res.status(200).json({ data: members });
    } catch (error) {
        next(error);
    }
};

// GET /api/manager/team/schedule
const getTeamSchedule = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Vui lòng cung cấp year và month' });

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        // Find team user IDs
        const members = await User.findAll({ where: { manager_id: managerId }, attributes: ['id'] });
        const userIds = members.map(m => m.id);

        const { Op } = require('sequelize');
        
        // Attendances
        const attendances = await Attendance.findAll({
            where: {
                user_id: { [Op.in]: userIds },
                date: { [Op.gte]: startDate, [Op.lte]: endDate }
            },
            include: [{ model: User, as: 'user', attributes: ['full_name', 'avatar_url'] }]
        });

        // Approved Leaves
        const leaves = await LeaveRequest.findAll({
             where: {
                 user_id: { [Op.in]: userIds },
                 status: 'Approved',
                 start_date: { [Op.lte]: endDate },
                 end_date: { [Op.gte]: startDate }
             },
             include: [
                 { model: User, as: 'user', attributes: ['full_name', 'avatar_url'] },
                 { model: LeaveType, as: 'leaveType', attributes: ['name'] }
             ]
        });

        res.status(200).json({ data: { attendances, leaves } });
    } catch (error) {
        next(error);
    }
};

// GET /api/manager/team/attendance
const getTeamAttendance = async (req, res, next) => {
     try {
        const managerId = req.user.id;
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Vui lòng cung cấp year và month' });

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Fetch team
        const members = await User.findAll({
             where: { manager_id: managerId },
             attributes: ['id', 'employee_code', 'full_name', 'avatar_url'],
             include: [{ model: Position, as: 'position', attributes: ['name'] }]
        });
        const userIds = members.map(m => m.id);

        const { Op } = require('sequelize');
        const attendances = await Attendance.findAll({
            where: { user_id: { [Op.in]: userIds }, date: { [Op.gte]: startDate, [Op.lte]: endDate } }
        });

        const overtimes = await OvertimeRequest.findAll({
             where: { user_id: { [Op.in]: userIds }, status: 'Approved', date: { [Op.gte]: startDate, [Op.lte]: endDate } }
        });

        const leaves = await LeaveRequest.findAll({
             where: { user_id: { [Op.in]: userIds }, status: 'Approved', start_date: { [Op.lte]: endDate }, end_date: { [Op.gte]: startDate } },
             include: [{ model: LeaveType, as: 'leaveType' }]
        });

        const userMap = {};
        members.forEach(u => {
             userMap[u.id] = {
                 id: u.id,
                 employee_code: u.employee_code,
                 full_name: u.full_name,
                 avatar_url: u.avatar_url,
                 position: u.position ? u.position.name : 'N/A',
                 present_days: 0,
                 late_days: 0,
                 absent_days: 0,
                 ot_hours: 0,
                 total_working_days: 0 // Will accumulate
             }
        });

        attendances.forEach(a => {
             if (userMap[a.user_id]) {
                 if (a.status === 'Present' || a.status === 'EarlyLeave') {
                     userMap[a.user_id].present_days += 1;
                     userMap[a.user_id].total_working_days += 1;
                 } else if (a.status === 'Late') {
                     userMap[a.user_id].late_days += 1;
                     userMap[a.user_id].total_working_days += 1;
                 } else if (a.status === 'Absent') {
                     userMap[a.user_id].absent_days += 1;
                 }
             }
        });

        overtimes.forEach(o => {
             if (userMap[o.user_id]) userMap[o.user_id].ot_hours += o.total_hours;
        });

        leaves.forEach(lv => {
             if (userMap[lv.user_id] && lv.leaveType) {
                 const typeName = lv.leaveType.name.toLowerCase();
                 // Phép sinh tính 1 ngày làm việc
                 if (typeName.includes('phép tháng') || typeName.includes('công tác')) {
                     let curr = moment(lv.start_date);
                     const end = moment(lv.end_date);
                     while (curr.isSameOrBefore(end)) {
                         const dateStr = curr.format('YYYY-MM-DD');
                         const dow = curr.day();
                         if (dateStr >= moment(startDate).format('YYYY-MM-DD') && 
                             dateStr <= moment(endDate).format('YYYY-MM-DD') && 
                             dow !== 0) {
                             userMap[lv.user_id].present_days += 1;
                             userMap[lv.user_id].total_working_days += 1;
                         }
                         curr.add(1, 'days');
                     }
                 }
             }
        });

        res.status(200).json({ data: Object.values(userMap) });
     } catch (error) {
         next(error);
     }
};

module.exports = {
    getTeamRequests,
    updateRequestStatus,
    getTeamMembers,
    getTeamSchedule,
    getTeamAttendance
};
