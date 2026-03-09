const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Chỉ manager mới được gọi các route này
router.use(verifyToken);
router.use(requireRole('Manager', 'Admin'));

router.get('/requests', managerController.getTeamRequests);
router.patch('/approve/:type/:id', managerController.updateRequestStatus);

module.exports = router;
