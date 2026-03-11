require('dotenv').config();
const { LeaveType } = require('./src/models');

async function addMissingLeaveTypes() {
  try {
    const existing = await LeaveType.findAll();
    const existingNames = existing.map(l => l.name);
    
    const requiredTypes = [
      { name: 'Sick Leave', description: 'Medical certificate', default_days: 10 },
      { name: 'Personal Leave', description: 'Personal affairs', default_days: 5 },
      { name: 'Business Trip', description: 'Working on-site elsewhere', default_days: 30 },
      { name: 'Annual Leave', description: 'Paid time off', default_days: 12 }
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
