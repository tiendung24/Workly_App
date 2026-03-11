const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/me', profileController.getProfile);
router.get('/dashboard', profileController.getDashboard);
router.put('/me', profileController.updateProfile);
router.put('/password', profileController.changePassword);

module.exports = router;
