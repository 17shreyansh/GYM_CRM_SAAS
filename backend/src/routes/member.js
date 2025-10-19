import express from 'express';
import { checkOut, getMyAttendance, scanGymQR } from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('member'));

// Member attendance routes
router.post('/attendance/scan-qr', scanGymQR);
router.post('/attendance/checkout', checkOut);
router.get('/attendance/my', getMyAttendance);

export default router;