const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/balance', leaveController.getBalance);
router.get('/requests', leaveController.getRequests);
router.post('/request', leaveController.createRequest);
router.get('/types', leaveController.getLeaveTypes);

module.exports = router;
