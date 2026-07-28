const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/admin/payrollController');
const { verifyToken, requireRole } = require('../../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Kế toán và Admin có quyền quản lý lương
router.use(verifyToken);
router.use(requireRole('Admin', 'Accountant'));

router.get('/', payrollController.getPayrolls);
router.post('/generate', payrollController.generatePayroll);
router.post('/import', upload.single('file'), payrollController.importPayroll);
router.post('/publish', payrollController.publishPayroll);
router.put('/:id', payrollController.updatePayroll);

module.exports = router;
