const { Payroll, Attendance, LeaveRequest, OvertimeRequest, User, Position } = require('../../models');
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const { notifyByRoles, createNotification } = require('../../services/notificationService');

// POST /api/admin/payroll/generate
// Tính lương cho tất cả nhân viên trong tháng
const generatePayroll = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) return res.status(400).json({ message: 'Month and year are required' });

        const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = `${year}-${String(month).padStart(2, '0')}-31`;
        const standardWorkingDays = 22;

        const users = await User.findAll({
            where: { is_active: true },
            include: [{ model: Position, as: 'position' }]
        });

        let generatedCount = 0;

        for (const user of users) {
            let baseSalary = 0;
            if (user.position && user.position.base_salary) {
                baseSalary = parseFloat(user.position.base_salary);
            }

            // 1. Actual days
            const attendances = await Attendance.findAll({
                where: {
                    user_id: user.id,
                    date: { [Op.between]: [firstDay, lastDay] },
                    check_in_time: { [Op.not]: null },
                    check_out_time: { [Op.not]: null },
                }
            });
            const actualWorkingDays = attendances.length;

            // 2. Paid leaves
            const leaves = await LeaveRequest.findAll({
                where: {
                    user_id: user.id,
                    status: 'Approved',
                    start_date: { [Op.between]: [firstDay, lastDay] }
                }
            });
            let paidLeaveDays = 0;
            leaves.forEach(leave => {
                const start = new Date(leave.start_date);
                const end = new Date(leave.end_date);
                const diffTime = Math.abs(end - start);
                paidLeaveDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            });

            // 3. Overtime
            const overtimes = await OvertimeRequest.findAll({
                where: {
                    user_id: user.id,
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
                    if (diffHours < 0) diffHours += 24;
                    totalOtHours += diffHours;
                }
            });

            const hourlyRate = baseSalary / standardWorkingDays / 8;
            const overtimePay = totalOtHours * hourlyRate * 1.5;

            const totalValidDays = actualWorkingDays + paidLeaveDays;
            const salaryFromDays = (baseSalary / standardWorkingDays) * totalValidDays;
            const netSalary = salaryFromDays + overtimePay;

            // Save to Payroll table
            const existing = await Payroll.findOne({ where: { user_id: user.id, month, year } });
            if (existing) {
                await existing.update({
                    base_salary: baseSalary,
                    standard_working_days: standardWorkingDays,
                    actual_working_days: totalValidDays, // gộp chung
                    overtime_hours: totalOtHours,
                    overtime_pay: overtimePay,
                    net_salary: netSalary,
                    status: 'Draft'
                });
            } else {
                await Payroll.create({
                    user_id: user.id,
                    month,
                    year,
                    base_salary: baseSalary,
                    standard_working_days: standardWorkingDays,
                    actual_working_days: totalValidDays,
                    overtime_hours: totalOtHours,
                    overtime_pay: overtimePay,
                    net_salary: netSalary,
                    status: 'Draft'
                });
            }
            generatedCount++;
        }

        res.status(200).json({ message: `Successfully generated payroll for ${generatedCount} employees.` });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/payroll/import
// Import từ Excel (cột yêu cầu: employee_code, month, year, net_salary)
const importPayroll = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let importedCount = 0;
        let errors = [];

        for (const row of data) {
            const { employee_code, month, year, net_salary, base_salary, actual_working_days, overtime_pay, allowances, deductions } = row;
            if (!employee_code || !month || !year || net_salary === undefined) {
                errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
                continue;
            }

            const user = await User.findOne({ where: { employee_code } });
            if (!user) {
                errors.push(`User not found: ${employee_code}`);
                continue;
            }

            const existing = await Payroll.findOne({ where: { user_id: user.id, month, year } });
            const payload = {
                base_salary: base_salary || 0,
                standard_working_days: 22,
                actual_working_days: actual_working_days || 0,
                overtime_pay: overtime_pay || 0,
                allowances: allowances || 0,
                deductions: deductions || 0,
                net_salary: net_salary,
                status: 'Draft'
            };

            if (existing) {
                await existing.update(payload);
            } else {
                await Payroll.create({ user_id: user.id, month, year, ...payload });
            }
            importedCount++;
        }

        res.status(200).json({ message: `Imported ${importedCount} records`, errors });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/payroll
// Lấy danh sách lương (có thể filter month, year)
const getPayrolls = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const where = {};
        if (month) where.month = month;
        if (year) where.year = year;

        const payrolls = await Payroll.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'employee_code'] }],
            order: [['year', 'DESC'], ['month', 'DESC']]
        });
        res.status(200).json({ data: payrolls });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/payroll/:id
// Sửa thủ công bảng lương
const updatePayroll = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { allowances, deductions, net_salary, status } = req.body;
        const payroll = await Payroll.findByPk(id);
        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

        await payroll.update({ allowances, deductions, net_salary, status });
        res.status(200).json({ message: 'Updated successfully', data: payroll });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/payroll/publish
// Công bố lương cho 1 tháng
const publishPayroll = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) return res.status(400).json({ message: 'Month and year are required' });

        await Payroll.update({ status: 'Published' }, { where: { month, year } });

        // Gửi thông báo cho toàn bộ nhân viên có lương tháng này
        const payrolls = await Payroll.findAll({ where: { month, year, status: 'Published' } });
        for (const p of payrolls) {
            await createNotification(p.user_id, 'Payslip Available', `Your payslip for ${month}/${year} has been published.`, 'PAYROLL');
        }

        res.status(200).json({ message: `Published payroll for ${month}/${year}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generatePayroll,
    importPayroll,
    getPayrolls,
    updatePayroll,
    publishPayroll
};
