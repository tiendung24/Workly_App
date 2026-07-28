const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Employee Payroll Routes
router.get('/', payrollController.getHistory);
router.get('/estimate', payrollController.getLiveEstimate);
router.get('/:id', payrollController.getPayrollDetail);

module.exports = router;
