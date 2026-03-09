const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/me', profileController.getProfile);
router.put('/me', profileController.updateProfile);

module.exports = router;
