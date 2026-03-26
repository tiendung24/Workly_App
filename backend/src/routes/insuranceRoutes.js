const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Mobile App Routes (Employee)
router.get('/my-status', verifyToken, insuranceController.getMyInsurance);
router.post('/create-payment-link', verifyToken, insuranceController.createPaymentLink);

// Webhook for PayOS
router.post('/webhook/payos', insuranceController.handlePayOSWebhook);

// Admin Web Portal Routes
router.get('/admin/dashboard', verifyToken, requireRole('Admin', 'Manager'), insuranceController.getAdminDashboard);
router.get('/admin/transactions', verifyToken, requireRole('Admin', 'Manager'), insuranceController.getAdminTransactions);

module.exports = router;
