import express from 'express';
import { body } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  markAssignmentComplete
} from '../controllers/assignmentController.js';

const router = express.Router();

router.post('/', [auth, adminAuth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('deadline').isISO8601().withMessage('Valid deadline required')
], createAssignment);

router.get('/', auth, getAssignments);

router.put('/:id', [auth, adminAuth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('deadline').isISO8601().withMessage('Valid deadline required')
], updateAssignment);

router.delete('/:id', [auth, adminAuth], deleteAssignment);

router.post('/:assignmentId/complete', auth, markAssignmentComplete);

export default router;