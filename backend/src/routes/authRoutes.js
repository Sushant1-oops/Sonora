const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidators');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/refresh', authController.refresh); 
router.post('/logout', authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);
router.get('/me', requireAuth, authController.me);

module.exports = router;
