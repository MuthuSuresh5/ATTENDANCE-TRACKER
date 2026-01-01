import express from 'express';
import { body } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import { getStudents, getProfile, createStudent, updateStudent, deleteStudent } from '../controllers/userController.js';

const router = express.Router();

router.get('/students', [auth, adminAuth], getStudents);
router.get('/profile', auth, getProfile);

router.post('/students', [auth, adminAuth,
  body('name').notEmpty().withMessage('Name is required'),
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], createStudent);

router.put('/students/:id', [auth, adminAuth,
  body('name').notEmpty().withMessage('Name is required'),
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], updateStudent);

router.delete('/students/:id', [auth, adminAuth], deleteStudent);

export default router;