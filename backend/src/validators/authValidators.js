const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');


function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw ApiError.badRequest('Validation failed', details);
  }
  next();
}

const registerRules = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and dots'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('displayName').trim().isLength({ min: 1, max: 50 }).withMessage('Display name is required'),
  validate,
];

const loginRules = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = { registerRules, loginRules, validate };
