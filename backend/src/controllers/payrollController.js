const { Payroll, Attendance, LeaveRequest, OvertimeRequest, User, Position } = require('../models');
const { Op } = require('sequelize');

// Lấy lịch sử lương của nhân viên (chỉ các phiếu đã Published)
const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const payrolls = await Payroll.findAll({
            where: { user_id: userId, status: 'Published' },
            order: [['year', 'DESC'], ['month', 'DESC']],
        });
        res.status(200).json({ data: payrolls });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết một bảng lương đã Published
const getPayrollDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findOne({
            where: { id, user_id: req.user.id, status: 'Published' }
        });
        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
        res.status(200).json({ data: payroll });
    } catch (error) {
        next(error);
    }
};

// Lấy Lương tạm tính (Live Estimate) cho tháng hiện tại
const getLiveEstimate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        // Lấy thông tin User và Lương cơ bản
        const user = await User.findByPk(userId, {
            include: [{ model: Position, as: 'position' }]
        });
        
        let baseSalary = 0;
        if (user && user.position && user.position.base_salary) {
            baseSalary = parseFloat(user.position.base_salary);
        }
        
        const standardWorkingDays = 22; // Cấu hình cứng hoặc lấy từ SystemConfig

        // 1. Tính số ngày đi làm thực tế (Có đủ check-in và check-out)
        // Lưu ý: date là yyyy-mm-dd
        const firstDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`; // đơn giản hóa

        const attendances = await Attendance.findAll({
            where: {
                user_id: userId,
                date: { [Op.between]: [firstDay, lastDay] },
                check_in_time: { [Op.not]: null },
                check_out_time: { [Op.not]: null },
            }
        });
        const actualWorkingDays = attendances.length;

        // 2. Tính số ngày nghỉ có phép (Paid Leave)
        // Giả sử các LeaveType thuộc loại có lương sẽ được cấu hình, 
        // ở đây ta đơn giản hóa: mọi đơn LeaveRequest status 'Approved' được tính là có phép (nếu không trừ lương).
        // Tạm thời coi mọi đơn 'Approved' là có phép (hưởng 100% lương).
        const leaves = await LeaveRequest.findAll({
            where: {
                user_id: userId,
                status: 'Approved',
                start_date: { [Op.between]: [firstDay, lastDay] }
            }
        });
        let paidLeaveDays = 0;
        leaves.forEach(leave => {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            paidLeaveDays += diffDays;
        });

        // 3. Tính tiền OT (Overtime)
        const overtimes = await OvertimeRequest.findAll({
            where: {
                user_id: userId,
                status: 'Approved',
                date: { [Op.between]: [firstDay, lastDay] }
            }
        });
        let totalOtHours = 0;
        overtimes.forEach(ot => {
            if (ot.start_time && ot.end_time) {
                const [h1, m1] = ot.start_time.split(':');
                const [h2, m2] = ot.end_time.split(':');
                let start = new Date(); start.setHours(h1, m1, 0);
                let end = new Date(); end.setHours(h2, m2, 0);
                let diffHours = (end - start) / 3600000;
                if (diffHours < 0) diffHours += 24; // OT qua đêm
                totalOtHours += diffHours;
            }
        });
        
        // Mức lương 1 giờ = Lương cơ bản / Ngày chuẩn / 8 giờ
        const hourlyRate = baseSalary / standardWorkingDays / 8;
        // Giả sử OT ngày thường x1.5
        const overtimePay = totalOtHours * hourlyRate * 1.5;

        // 4. Tổng hợp lương tạm tính
        const totalValidDays = actualWorkingDays + paidLeaveDays;
        
        const salaryFromDays = (baseSalary / standardWorkingDays) * totalValidDays;
        
        // Trừ đi các ngày không đi làm, không có phép. 
        // Nhưng công thức (baseSalary / 22) * totalValidDays đã tự động không tính tiền cho những ngày nghỉ không phép rồi.
        const netSalary = salaryFromDays + overtimePay;

        res.status(200).json({
            data: {
                month: currentMonth,
                year: currentYear,
                base_salary: baseSalary,
                standard_working_days: standardWorkingDays,
                actual_working_days: actualWorkingDays,
                paid_leave_days: paidLeaveDays,
                overtime_hours: totalOtHours,
                overtime_pay: overtimePay,
                net_salary: netSalary
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHistory,
    getPayrollDetail,
    getLiveEstimate
};
