const mysql = require('mysql2/promise');

async function go() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '12345',
      database: 'Workly'
    });
    
    const [rows] = await conn.query('SELECT id, name, base_salary FROM Positions');
    console.log(JSON.stringify(rows));
    conn.end();
  } catch(e) {
    console.log("Local DB Error:", e.message);
  }
}
go();
