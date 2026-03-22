const { Attendance, WorkShift, LeaveRequest, LeaveType, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { createAndEmit } = require('../services/notificationService');

const getTodayDateStr = () => {
    return moment().format('YYYY-MM-DD');
};

const getTodayAndShift = async (userId) => {
    const today = getTodayDateStr();
    // 1. Get user's current attendance record for today (if any)
    const attendance = await Attendance.findOne({
        where: { user_id: userId, date: today },
        include: [{ model: WorkShift, as: 'workShift' }]
    });
    return { today, attendance };
};

// POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { today, attendance } = await getTodayAndShift(userId);

        if (attendance && attendance.check_in_time) {
            return res.status(400).json({ message: 'You already checked in today' });
        }

        // Logic to determine shift (in a real app, this might depend on user's assigned shift or current time)
        // For simplicity, grab the first shift
        const shift = await WorkShift.findOne();
        if (!shift) {
            return res.status(400).json({ message: 'No work shift configured in system' });
        }

        const now = new Date();
        const checkInTimeStr = moment(now).format('HH:mm:ss');
        
        // Tính Toán Giờ Trễ Tối Đa Cho Phép (đã cộng biên độ muộn)
        const shiftStartTime = moment(shift.start_time, 'HH:mm:ss');
        const allowedTimeStr = shiftStartTime.add(shift.grace_period_minutes || 0, 'minutes').format('HH:mm:ss');

        let status = 'Present'; // Default

        // Nếu check-in muộn hơn khoảng châm chước thì ghi nhận đi muộn
        if (checkInTimeStr > allowedTimeStr) {
            status = 'Late';
        }

        let newAttendance;
        if (attendance) {
            // Already absent/off but now checking in
            attendance.check_in_time = now;
            attendance.work_shift_id = shift.id;
            attendance.status = status;
            await attendance.save();
            newAttendance = attendance;
        } else {
            // Create new record
            newAttendance = await Attendance.create({
                user_id: userId,
                date: today,
                check_in_time: now,
                work_shift_id: shift.id,
                status: status
            });
        }

        // --- Notification: Check-in trễ ---
        if (status === 'Late') {
            const currentUser = await User.findByPk(userId);
            if (currentUser && currentUser.manager_id) {
                await createAndEmit(
                    currentUser.manager_id,
                    'Late check-in',
                    `${currentUser.full_name} checked in late at ${checkInTimeStr} (Shift start: ${shift.start_time}).`,
                    'LATE_CHECK_IN',
                    newAttendance.id
                );
            }
        }

        res.status(200).json({
            message: 'Check-in successful',
            data: newAttendance
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { today, attendance } = await getTodayAndShift(userId);

        if (!attendance || !attendance.check_in_time) {
            return res.status(400).json({ message: 'You have not checked in today, cannot check out' });
        }

        if (attendance.check_out_time) {
            return res.status(400).json({ message: 'You already checked out today' });
        }

        const shift = attendance.workShift;
        const now = new Date();
        const checkOutTimeStr = moment(now).format('HH:mm:ss');
        
        let status = attendance.status;

        let isEarlyLeave = false;
        if (shift && checkOutTimeStr < shift.end_time) {
            // Nếu check-out sớm hơn giờ kết thúc ca
            if (status === 'Present') status = 'EarlyLeave';
            isEarlyLeave = true;
            // Nếu đã Late rồi thì thành Late (hoặc Late_EarlyLeave tuỳ logic công ty)
        }

        attendance.check_out_time = now;
        attendance.status = status;
        await attendance.save();

        // --- Notification: Check-out sớm ---
        if (isEarlyLeave) {
            const currentUser = await User.findByPk(userId);
            if (currentUser && currentUser.manager_id) {
                await createAndEmit(
                    currentUser.manager_id,
                    'Early check-out',
                    `${currentUser.full_name} checked out early at ${checkOutTimeStr} (Shift ends: ${shift.end_time}).`,
                    'EARLY_CHECK_OUT',
                    attendance.id
                );
            }
        }

        res.status(200).json({
            message: 'Check-out successful',
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const today = getTodayDateStr();

        const config = await WorkShift.findOne(); // Lấy ca mặc định để UI hiển thị

        const attendance = await Attendance.findOne({
            where: { user_id: userId, date: today },
            include: [{ model: WorkShift, as: 'workShift' }]
        });

        res.status(200).json({
            date: today,
            attendance: attendance || null,
            shift: config || null
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/attendance/monthly
const getMonthly = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { year, month } = req.query; // VD: 2026, 03

        if (!year || !month) {
            return res.status(400).json({ message: 'Please provide year and month' });
        }

        // Tạo chuỗi năm tháng, vd: "2026-03"
        // month pad start đảm bảo luôn có 2 chữ số
        const formattedMonth = month.toString().padStart(2, '0');
        const startDate = moment(`${year}-${formattedMonth}-01`).startOf('month').format('YYYY-MM-DD');
        const endDate = moment(`${year}-${formattedMonth}-01`).endOf('month').format('YYYY-MM-DD');

        const attendances = await Attendance.findAll({
            where: {
                user_id: userId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });

        const leaves = await LeaveRequest.findAll({
            where: {
                user_id: userId,
                status: 'Approved',
                start_date: { [Op.lte]: endDate },
                end_date: { [Op.gte]: startDate }
            },
            include: [{ model: LeaveType, as: 'leaveType' }]
        });

        // Convert db results to simple objects so we can merge
        const dataMap = {};
        attendances.forEach(a => {
            dataMap[a.date] = a.toJSON();
        });

        leaves.forEach(lv => {
            let curr = moment(lv.start_date);
            const end = moment(lv.end_date);
            while (curr.isSameOrBefore(end)) {
                const dateStr = curr.format('YYYY-MM-DD');
                if (dateStr >= startDate && dateStr <= endDate) {
                    if (!dataMap[dateStr]) {
                        dataMap[dateStr] = { date: dateStr };
                    }
                    dataMap[dateStr].status = 'Leave';
                    dataMap[dateStr].leaveInfo = {
                        type: lv.leaveType ? lv.leaveType.name : 'Leave',
                        reason: lv.reason
                    };
                }
                curr.add(1, 'days');
            }
        });

        res.status(200).json({
            data: Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date))
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkIn,
    checkOut,
    getTodayStatus,
    getMonthly
};
