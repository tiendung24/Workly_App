const { Attendance, WorkShift } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// GET /api/schedule/monthly
const getMonthly = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Please provide year and month' });
        }

        const formattedMonth = month.toString().padStart(2, '0');
        const startDateString = `${year}-${formattedMonth}-01`;
        const startOfMonth = moment(startDateString).startOf('month');
        const endOfMonth = moment(startDateString).endOf('month');

        const startDate = startOfMonth.format('YYYY-MM-DD');
        const endDate = endOfMonth.format('YYYY-MM-DD');

        // Lấy tất cả bản ghi chấm công trong tháng
        const attendances = await Attendance.findAll({
            where: {
                user_id: userId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{ model: WorkShift, as: 'workShift' }]
        });

        // Map data để trả về mảng dễ dùng cho UI ({ '2026-03-01': { status: 'Present', shift: '08:00 - 17:00' } })
        const attendanceMap = {};
        attendances.forEach(att => {
            attendanceMap[att.date] = att;
        });

        // Xây dựng mảng full ngày cho tháng
        const schedule = [];
        let currentDay = moment(startDateString).startOf('month');
        const endDay = moment(startDateString).endOf('month');
        
        while (currentDay.isSameOrBefore(endDay)) {
            const dateStr = currentDay.format('YYYY-MM-DD');
            const attendanceRecord = attendanceMap[dateStr];
            
            // Xử lý status
            let finalStatus = 'Off'; // Mặc định nếu không có dữ liệu
            let shiftDisplay = 'No shift';
            
            if (attendanceRecord) {
                finalStatus = attendanceRecord.status;
                if (attendanceRecord.workShift) {
                    shiftDisplay = `${attendanceRecord.workShift.start_time.substring(0,5)} - ${attendanceRecord.workShift.end_time.substring(0,5)}`;
                }
            } else if (currentDay.day() !== 0) { // Không phải chủ nhật
                 // Nếu không phải chủ nhật, và thuộc ngày quá khứ => Absent
                 if (currentDay.isBefore(moment(), 'day')) {
                     finalStatus = 'Absent';
                 } else {
                     finalStatus = 'Pending'; // Tương lai chưa đánh dấu
                 }
            }

            schedule.push({
                date: dateStr,
                dayOfWeek: currentDay.format('ddd'), // Thu, Fri, vv..
                status: finalStatus,
                shift: shiftDisplay,
                checkIn: attendanceRecord?.check_in_time ? moment(attendanceRecord.check_in_time).toISOString() : null,
                checkOut: attendanceRecord?.check_out_time ? moment(attendanceRecord.check_out_time).toISOString() : null
            });
            
            currentDay.add(1, 'day');
        }

        res.status(200).json({
            year,
            month: formattedMonth,
            data: schedule
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMonthly
};
