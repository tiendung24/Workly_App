const { InsuranceRecord, Position, User, sequelize } = require('./src/models');
const mysql = require('mysql2/promise');

async function restore() {
  try {
    await sequelize.authenticate();
    console.log("TiDB Connected");
    
    const conn = await mysql.createConnection({
      host: '127.0.0.1', port: 3306, user: 'root', password: '12345', database: 'Workly'
    });
    console.log("Local DB Connected");
    
    const [rows] = await conn.query('SELECT id, base_salary FROM Positions');
    
    for (const r of rows) {
      await Position.update({ base_salary: r.base_salary }, { where: { id: r.id } });
    }
    console.log("Positions Restored");
    
    // Revert InsuranceRecords
    const records = await InsuranceRecord.findAll({ 
        where: { status: 'Unpaid' }, 
        include: [{ model: User, as: 'user', include: ['position'] }] 
    });
    
    for (const rec of records) {
       if (rec.user && rec.user.position) {
          const fee = parseFloat(rec.user.position.base_salary) * 0.105;
          await InsuranceRecord.update({ monthly_fee: fee }, { where: { id: rec.id } });
       }
    }
    console.log("Insurance Records Restored");
    
    conn.end();
  } catch (e) {
    console.error("Restore Error:", e);
  } finally {
    process.exit(0);
  }
}
restore();
