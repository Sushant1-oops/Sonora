const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/:username', userController.getPublicProfile);
router.patch('/me', requireAuth, userController.updateProfile);

module.exports = router;
