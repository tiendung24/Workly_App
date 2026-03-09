const { Attendance, OvertimeRequest, CorrectionRequest, LeaveRequest, LeaveType, User, Department } = require('../../models');
const moment = require('moment');

// GET /api/admin/timesheet?year=YYYY&month=MM
const getTimesheet = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Vui lòng cung cấp year và month' });

        // Build start/end date for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Fetch users
        const users = await User.findAll({
             attributes: ['id', 'employee_code', 'full_name'],
             include: [{ model: Department, as: 'department', attributes: ['name'] }]
        });

        // 1. Fetch Attendances within range
        const { Op } = require('sequelize');
        const attendances = await Attendance.findAll({
            where: {
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            }
        });

        // 2. Fetch Overtimes Approved within range
        const overtimes = await OvertimeRequest.findAll({
             where: {
                 status: 'Approved',
                 date: {
                   [Op.gte]: startDate,
                   [Op.lte]: endDate
                 }
             }
        });

        // 3. Fetch Leaves Approved within range (for Phép Năm, Công Tác)
        const leaves = await LeaveRequest.findAll({
             where: {
                 status: 'Approved',
                 start_date: { [Op.lte]: endDate },
                 end_date: { [Op.gte]: startDate }
             },
             include: [{ model: LeaveType, as: 'leaveType' }]
        });

        // Aggregate per user map
        const userMap = {};
        users.forEach(u => {
             userMap[u.id] = {
                 id: u.id,
                 employee_code: u.employee_code,
                 full_name: u.full_name,
                 department: u.department ? u.department.name : 'N/A',
                 present_days: 0,
                 late_days: 0,
                 ot_hours: 0,
             }
        });

        attendances.forEach(a => {
             if (userMap[a.user_id]) {
                 if (a.status === 'Present' || a.status === 'EarlyLeave') {
                     userMap[a.user_id].present_days += 1;
                 } else if (a.status === 'Late') {
                     userMap[a.user_id].late_days += 1;
                 }
             }
        });

        overtimes.forEach(o => {
             if (userMap[o.user_id]) {
                 userMap[o.user_id].ot_hours += o.total_hours;
             }
        });

        leaves.forEach(lv => {
             if (userMap[lv.user_id] && lv.leaveType) {
                 const typeName = lv.leaveType.name.toLowerCase();
                 // Phép năm và công tác vẫn được tính là 1 ngày công
                 if (typeName.includes('phép năm') || typeName.includes('công tác')) {
                     let curr = moment(lv.start_date);
                     const end = moment(lv.end_date);
                     while (curr.isSameOrBefore(end)) {
                         const dateStr = curr.format('YYYY-MM-DD');
                         const dow = curr.day();
                         // Bỏ qua Chủ nhật (0)
                         if (dateStr >= moment(startDate).format('YYYY-MM-DD') && 
                             dateStr <= moment(endDate).format('YYYY-MM-DD') && 
                             dow !== 0) {
                             userMap[lv.user_id].present_days += 1;
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
   getTimesheet
};
