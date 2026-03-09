require('dotenv').config();
const { LeaveType } = require('./src/models');

async function addMissingLeaveTypes() {
  try {
    const existing = await LeaveType.findAll();
    const existingNames = existing.map(l => l.name);
    
    const requiredTypes = [
      { name: 'Nghỉ Ốm', description: 'Có giấy bác sĩ', default_days: 10 },
      { name: 'Việc Cá Nhân', description: 'Giải quyết việc riêng', default_days: 5 },
      { name: 'Công Tác', description: 'Đi làm việc tại đối tác', default_days: 30 }
    ];

    for (const type of requiredTypes) {
      if (!existingNames.includes(type.name)) {
        await LeaveType.create(type);
      }
    }

    console.log('✅ Cập nhật thêm thẻ nghỉ thành công');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
    process.exit(1);
  }
}

addMissingLeaveTypes();
