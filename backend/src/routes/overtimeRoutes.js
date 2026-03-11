const express = require('express');
const router = express.Router();
const overtimeController = require('../controllers/overtimeController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/requests', overtimeController.getRequests);
router.post('/request', overtimeController.createRequest);

module.exports = router;
