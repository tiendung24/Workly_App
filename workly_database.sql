CREATE DATABASE Workly ;
USE Workly;
-- 1. Bảng Phòng ban
CREATE TABLE Departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Chức vụ (Position)
CREATE TABLE Positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL, -- Ví dụ: Developer, HR, Accountant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Ca làm việc (Để định nghĩa giờ vào/ra chuẩn)
CREATE TABLE WorkShifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL, -- Ví dụ: Ca hành chính, Ca sáng
    start_time TIME NOT NULL,  -- 08:00:00
    end_time TIME NOT NULL,    -- 17:00:00
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Người dùng (Nhân viên/Quản lý/Admin)
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) UNIQUE NOT NULL, -- Mã NV
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Mật khẩu đã mã hóa
    phone VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(255),
    
    department_id INT,
    position_id INT,
    manager_id INT, -- Người quản lý trực tiếp (Self-referencing)
    
    role ENUM('Admin', 'Manager', 'Employee') DEFAULT 'Employee', -- Phân quyền truy cập app
    
    start_date DATE, -- Ngày bắt đầu làm việc
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES Departments(id),
    FOREIGN KEY (position_id) REFERENCES Positions(id),
    FOREIGN KEY (manager_id) REFERENCES Users(id) -- Quan hệ: Nhân viên thuộc Manager nào
);

-- 5. Bảng Chấm công hàng ngày (Timekeeping)
CREATE TABLE Attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    
    work_shift_id INT, -- Ca làm việc của ngày hôm đó
    
    status ENUM('Present', 'Late', 'EarlyLeave', 'Absent', 'Off') DEFAULT 'Absent',
    note TEXT, -- Ghi chú hệ thống
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (work_shift_id) REFERENCES WorkShifts(id),
    UNIQUE(user_id, date) -- Mỗi người chỉ có 1 bản ghi chấm công mỗi ngày
);

-- 6. Bảng Loại nghỉ phép (Annual, Sick, Unpaid...)
CREATE TABLE LeaveTypes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    days_allowed_per_year INT DEFAULT 12, -- Số ngày cho phép mặc định
    is_paid BOOLEAN DEFAULT TRUE -- Có lương hay không
);

-- 7. Bảng Quỹ phép của nhân viên (Leave Balance)
CREATE TABLE UserLeaveBalances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL, -- Năm quản lý (VD: 2026)
    total_days INT NOT NULL, -- Tổng ngày có
    used_days FLOAT DEFAULT 0, -- Số ngày đã dùng
    remaining_days FLOAT GENERATED ALWAYS AS (total_days - used_days) STORED, -- Tự động tính
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (leave_type_id) REFERENCES LeaveTypes(id)
);

-- 8. Bảng Yêu cầu Nghỉ phép (Leave Requests)
CREATE TABLE LeaveRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approver_id INT, -- Người duyệt (Manager)
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (leave_type_id) REFERENCES LeaveTypes(id),
    FOREIGN KEY (approver_id) REFERENCES Users(id)
);

-- 9. Bảng Yêu cầu Làm thêm giờ (OT Requests)
CREATE TABLE OvertimeRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours FLOAT NOT NULL, -- Ví dụ: 1.5 giờ
    reason TEXT,
    
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approver_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (approver_id) REFERENCES Users(id)
);

-- 10. Bảng Yêu cầu Giải trình chấm công (Correction Requests)
CREATE TABLE CorrectionRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL, -- Ngày cần sửa
    
    type ENUM('Forgot_CheckIn', 'Forgot_CheckOut', 'Wrong_Time', 'Work_Outside') NOT NULL,
    requested_check_in DATETIME, -- Giờ muốn sửa
    requested_check_out DATETIME, -- Giờ muốn sửa
    reason TEXT NOT NULL,
    
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approver_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (approver_id) REFERENCES Users(id)
);

UPDATE Users SET role = 'Admin' WHERE email = 'admin@gmail.com';



select * from users ;