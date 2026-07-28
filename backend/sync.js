const db = require('./src/config/db');
const { Payroll } = require('./src/models');

async function syncDb() {
    try {
        await Payroll.sync({ alter: true });
        console.log('Payroll synced');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
syncDb();
