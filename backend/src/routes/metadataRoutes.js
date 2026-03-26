const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController');

// These are public for registration or semi-public
router.get('/departments', metadataController.getDepartments);
router.get('/positions', metadataController.getPositions);

module.exports = router;
