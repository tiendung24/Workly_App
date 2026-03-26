// mobile/src/_utils/homeConfig.js

// Roles: "employee" | "manager" | "admin"
export function getQuickActions(role = "employee") {
  const employee = [
    { key: "timesheet", label: "Correction", icon: "assignment", tone: "blue" },       // giải trình / bù công
    { key: "leave", label: "Leave", icon: "event-note", tone: "orange" },            // xin nghỉ
    { key: "overtime", label: "Overtime", icon: "timer", tone: "purple" },           // đăng ký OT
    { key: "schedule", label: "Schedule", icon: "calendar-today", tone: "green" },   // lịch làm/ca
    { key: "insurance", label: "Insurance", icon: "health-and-safety", tone: "red" }, // bảo hiểm
  ];

  const manager = [
    { key: "approve_leave", label: "Approve Leave", icon: "task-alt", tone: "green" },
    { key: "approve_ot", label: "Approve OT", icon: "rule", tone: "purple" },
    { key: "dept_timesheet", label: "Dept Timesheet", icon: "table-view", tone: "blue" },
    { key: "shift_mgmt", label: "Shift Mgmt", icon: "edit-calendar", tone: "orange" },
    { key: "reports", label: "Reports", icon: "bar-chart", tone: "indigo" },
  ];

  const admin = [
    { key: "employees", label: "Employees", icon: "groups", tone: "blue" },
    { key: "departments", label: "Departments", icon: "apartment", tone: "purple" },
    { key: "payroll", label: "Payroll", icon: "payments", tone: "green" },
  ];

  if (role === "manager") return [...employee, ...manager];
  if (role === "admin") return [...employee, ...admin];
  return employee;
}

// Bottom nav (employee)
export const HOME_TABS = [
  { key: "Home", label: "Home", icon: "home" },
  { key: "Timesheet", label: "Correction", icon: "history" },
  // Center FAB: Check
  { key: "Requests", label: "Requests", icon: "assignment" }, // nghỉ + OT
  { key: "Profile", label: "Profile", icon: "person" },
];