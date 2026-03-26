
USE Workly;
-- 1. Bảng Phòng ban
CREATE TABLE Departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Chức vụ (Position)
CREATE TABLE Positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL, -- Ví dụ: Developer, HR, Accountant
    base_salary DECIMAL(15,2) DEFAULT 0, -- Lương cơ bản của vị trí
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

-- 11. Bảng InsuranceRecords
CREATE TABLE InsuranceRecords (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    
    monthly_fee DECIMAL(15,2) NOT NULL,
    old_debt DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (monthly_fee + old_debt) STORED,
    
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    UNIQUE(user_id, month, year)
);
-- 12. Bảng Transactions
CREATE TABLE Transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    insurance_record_id INT,
    
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    
    status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    payos_webhook_data JSON,
    
    transaction_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (insurance_record_id) REFERENCES InsuranceRecords(id)
);

-- ==============================================
-- DỮ LIỆU MẪU (WIPE & SEED - AUTO MIGRATION)
-- ==============================================
-- DELETE FROM Transactions;
-- DELETE FROM InsuranceRecords;
-- DELETE FROM CorrectionRequests;
-- DELETE FROM OvertimeRequests;
-- DELETE FROM LeaveRequests;
-- DELETE FROM UserLeaveBalances;
-- DELETE FROM LeaveTypes;
-- DELETE FROM Attendance;
-- DELETE FROM Users;
-- DELETE FROM WorkShifts;
-- DELETE FROM Positions;
-- DELETE FROM Departments;

-- 1. Departments
INSERT INTO Departments (id,name,description,code) VALUES
(1, 'Phòng Nhân Sự', 'Human Resources', 'HR'),
(2, 'Phòng Kỹ Thuật', 'Information Technology', 'IT'),
(3, 'Phòng Kinh Doanh', 'Sales Department', 'SALE'),
(4, 'Phòng Marketing', 'Marketing Department', 'MKT'),
(5, 'Phòng Kế Toán', 'Accounting Department', 'ACC'),
(6, 'Phòng Hành Chính', 'Administration Department', 'ADMIN');

-- 2. Positions
INSERT INTO Positions (id,name,base_salary) VALUES
(1, 'Nhân viên Nhân sự', 15000000.00),
(2, 'Backend Developer', 25000000.00),
(3, 'Frontend Developer', 25000000.00),
(4, 'Mobile Developer', 25000000.00),
(5, 'Tester (QA/QC)', 16000000.00),
(6, 'DevOps Engineer', 25000000.00),
(7, 'Nhân viên Kinh doanh', 18000000.00),
(8, 'Nhân viên Chăm sóc khách hàng', 10000000.00),
(9, 'Content Marketing', 18000000.00),
(10, 'Digital Marketing', 18000000.00),
(11, 'SEO Specialist', 18000000.00),
(12, 'Nhân viên Kế toán', 15000000.00),
(13, 'Nhân viên Hành chính', 15000000.00),
(14, 'Lễ tân', 100000.00);

-- 3. WorkShifts
INSERT INTO WorkShifts (id,name,start_time,end_time) VALUES
(1, 'Ca Hành Chính', '08:30:00', '17:30:00'),
(3, 'Ca sáng', '06:00:00', '14:00:00'),
(4, 'Ca chiều', '14:00:00', '22:00:00');

-- 4. Users (Mật khẩu mặc định: 123456)
INSERT INTO Users (id,employee_code,full_name,email,password_hash,phone,address,avatar_url,department_id,position_id,manager_id,role,start_date,is_active) VALUES
(1, 'HE180957', 'Nguyễn Tiến Dũng', 'tien.dungg2011@gmail.com', '$2b$10$JAYWx9B7ZMxRY3nZNSmikeV/C/X9UcBTuolHFA7VEgjsoZr2u6xim', '0352033029', 'Cầu Giấy, Hà Nội', 'https://media.istockphoto.com/id/2171248303/vi/anh/th%C3%A1p-r%C3%B9a-t%E1%BA%A1i-h%C3%A0-n%E1%BB%99i-vi%E1%BB%87t-nam.jpg?s=612x612&w=0&k=20&c=E9ZYD_jtv4QEaDFFbF6AWgSWOo-o33ScfCZZlk2o_TY=', NULL, 6, NULL, 'Employee', '2026-03-10', 1),
(2, 'EMP3128', 'Hệ Thống Admin', 'admin@gmail.com', '$2b$10$IgXcAcVt2f1TRzZ9.wCsOeIjAqxyXGX9f93dGuJPZsw1kYDstAufG', '09847376347', NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-03-09', 1),
(3, 'EMP4771', 'Minh Hiếu', 'minhhieu@gmail.com', '$2b$10$kItEYR0gShOdhrlstQuWTOx0X8rm.7MDl2HlG.UkkpBvnfztTIk6S', '09738636245', NULL, NULL, NULL, 6, NULL, 'Employee', '2026-03-09', 1),
(4, 'HE0000', 'Nguyễn Đức Tài', 'ductai@gmail.com', '$2b$10$dP3jNyQ5ik52uicw6F5iv.u8x0R7LqmFb5oDA.vqbYRimGaNYsLXm', NULL, NULL, NULL, NULL, NULL, NULL, 'Employee', '2026-03-10', 1),
(5, 'HE180960', 'Kim Ji Won', 'kjw@gmail.com', '$2b$10$Q1RbwhlWuO3RrcT8So..4OSjht4cgXZ./N4yJxaRMM1.LR2Pj0QP6', '0352033028', 'HNoi', 'https://resource.kinhtedothi.vn/2024/05/20/kim-ji-won-1a4.jpg', NULL, 6, NULL, 'Employee', '2026-03-10', 1),
(6, 'MGR001', 'Manager', 'manager@gmail.com', '$2b$10$5dh0ZHTDnJG/Jxzb.stuhuX5y7nZ.9WgJCpaou6b8BlGdAqA8Uszu', '0987654321', 'Hà Nội', NULL, NULL, NULL, NULL, 'Manager', '2026-03-10', 1);

-- 5. LeaveTypes
INSERT INTO LeaveTypes (id,name,days_allowed_per_year,is_paid) VALUES
(1, 'Annual Leave', 12, 1),
(2, 'Sick Leave', 0, 1),
(3, 'Personal Leave', 0, 1),
(4, 'Business Trip', 0, 1);

-- 6. UserLeaveBalances
INSERT INTO UserLeaveBalances (id,user_id,leave_type_id,year,total_days,used_days) VALUES
(1, 3, 1, 2026, 12, 2),
(2, 1, 1, 2026, 12, 0),
(3, 5, 1, 2026, 12, 0);


select * from Positions



