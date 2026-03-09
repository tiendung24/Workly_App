const express = require('express');
const router = express.Router();
const correctionController = require('../controllers/correctionController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/requests', correctionController.getRequests);
router.post('/request', correctionController.createRequest);

module.exports = router;
