// File tổng hợp: import tất cả models và định nghĩa associations
const sequelize = require('../config/db');

const Department = require('./Department');
const Position = require('./Position');
const WorkShift = require('./WorkShift');
const User = require('./User');
const Attendance = require('./Attendance');
const LeaveType = require('./LeaveType');
const UserLeaveBalance = require('./UserLeaveBalance');
const LeaveRequest = require('./LeaveRequest');
const OvertimeRequest = require('./OvertimeRequest');
const CorrectionRequest = require('./CorrectionRequest');
const Notification = require('./Notification');
const InsuranceRecord = require('./InsuranceRecord');
const Transaction = require('./Transaction');

// ==================== ASSOCIATIONS ====================

// User ↔ Department
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// User ↔ Position
Position.hasMany(User, { foreignKey: 'position_id', as: 'users' });
User.belongsTo(Position, { foreignKey: 'position_id', as: 'position' });

// User ↔ User (Manager – self-referencing)
User.hasMany(User, { foreignKey: 'manager_id', as: 'subordinates' });
User.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// User ↔ Attendance
User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// WorkShift ↔ Attendance
WorkShift.hasMany(Attendance, { foreignKey: 'work_shift_id', as: 'attendances' });
Attendance.belongsTo(WorkShift, { foreignKey: 'work_shift_id', as: 'workShift' });

// User ↔ UserLeaveBalance
User.hasMany(UserLeaveBalance, { foreignKey: 'user_id', as: 'leaveBalances' });
UserLeaveBalance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// LeaveType ↔ UserLeaveBalance
LeaveType.hasMany(UserLeaveBalance, { foreignKey: 'leave_type_id', as: 'balances' });
UserLeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });

// User ↔ LeaveRequest (người tạo)
User.hasMany(LeaveRequest, { foreignKey: 'user_id', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ LeaveRequest (người duyệt)
User.hasMany(LeaveRequest, { foreignKey: 'approver_id', as: 'approvedLeaves' });
LeaveRequest.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// LeaveType ↔ LeaveRequest
LeaveType.hasMany(LeaveRequest, { foreignKey: 'leave_type_id', as: 'requests' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });

// User ↔ OvertimeRequest (người tạo)
User.hasMany(OvertimeRequest, { foreignKey: 'user_id', as: 'overtimeRequests' });
OvertimeRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ OvertimeRequest (người duyệt)
User.hasMany(OvertimeRequest, { foreignKey: 'approver_id', as: 'approvedOvertimes' });
OvertimeRequest.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// User ↔ CorrectionRequest (người tạo)
User.hasMany(CorrectionRequest, { foreignKey: 'user_id', as: 'correctionRequests' });
CorrectionRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ CorrectionRequest (người duyệt)
User.hasMany(CorrectionRequest, { foreignKey: 'approver_id', as: 'approvedCorrections' });
CorrectionRequest.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ InsuranceRecord
User.hasMany(InsuranceRecord, { foreignKey: 'user_id', as: 'insuranceRecords' });
InsuranceRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Transaction
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// InsuranceRecord ↔ Transaction
InsuranceRecord.hasMany(Transaction, { foreignKey: 'insurance_record_id', as: 'transactions' });
Transaction.belongsTo(InsuranceRecord, { foreignKey: 'insurance_record_id', as: 'insuranceRecord' });

// ==================== EXPORT ====================

module.exports = {
    sequelize,
    Department,
    Position,
    WorkShift,
    User,
    Attendance,
    LeaveType,
    UserLeaveBalance,
    LeaveRequest,
    OvertimeRequest,
    CorrectionRequest,
    Notification,
    InsuranceRecord,
    Transaction,
};
