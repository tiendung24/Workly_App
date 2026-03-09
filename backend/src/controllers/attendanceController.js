const { Attendance, WorkShift } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment'); // You might need to install moment, or use native Date

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
            return res.status(400).json({ message: 'Bạn đã check-in hôm nay rồi' });
        }

        // Logic to determine shift (in a real app, this might depend on user's assigned shift or current time)
        // For simplicity, grab the first shift
        const shift = await WorkShift.findOne();
        if (!shift) {
            return res.status(400).json({ message: 'Hệ thống chưa cấu hình ca làm việc' });
        }

        const now = new Date();
        const checkInTimeStr = moment(now).format('HH:mm:ss');
        const shiftStartTimeStr = shift.start_time; // '08:00:00'

        let status = 'Present'; // Default

        // Biến đổi string hours để so sánh (VD: 08:00:00)
        if (checkInTimeStr > shiftStartTimeStr) {
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

        res.status(200).json({
            message: 'Check-in thành công',
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
            return res.status(400).json({ message: 'Bạn chưa check-in hôm nay, không thể check-out' });
        }

        if (attendance.check_out_time) {
            return res.status(400).json({ message: 'Bạn đã check-out hôm nay rồi' });
        }

        const shift = attendance.workShift;
        const now = new Date();
        const checkOutTimeStr = moment(now).format('HH:mm:ss');
        
        let status = attendance.status;

        if (shift && checkOutTimeStr < shift.end_time) {
            // Nếu check-out sớm hơn giờ kết thúc ca
            if (status === 'Present') status = 'EarlyLeave';
            // Nếu đã Late rồi thì thành Late (hoặc Late_EarlyLeave tuỳ logic công ty)
        }

        attendance.check_out_time = now;
        attendance.status = status;
        await attendance.save();

        res.status(200).json({
            message: 'Check-out thành công',
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
            return res.status(400).json({ message: 'Vui lòng cung cấp year và month' });
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

        res.status(200).json({
            data: attendances
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
