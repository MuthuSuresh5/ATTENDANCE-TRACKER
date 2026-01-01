import express from 'express';
import { body } from 'express-validator';
import { login, register, changePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', [
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
], login);

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('role').isIn(['admin', 'student']).withMessage('Role must be admin or student')
], register);

router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], changePassword);

export default router;