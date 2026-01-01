import express from 'express';
import { body } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
  getMonthlyAttendance,
  getEditHistory,
  exportAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark', [auth, adminAuth,
  body('studentId').isMongoId().withMessage('Valid student ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('status').isIn(['present', 'absent']).withMessage('Status must be present or absent')
], markAttendance);

router.get('/', auth, getAttendance);
router.get('/summary/:studentId?', auth, getAttendanceSummary);
router.get('/monthly/:studentId?', auth, getMonthlyAttendance);
router.get('/history', auth, getEditHistory);
router.get('/export', [auth, adminAuth], exportAttendance);

export default router;