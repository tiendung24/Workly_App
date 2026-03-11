const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/monthly', scheduleController.getMonthly);

module.exports = router;
