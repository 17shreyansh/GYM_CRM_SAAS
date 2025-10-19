import express from 'express';
import { 
  createGym, 
  updateGymDetails, 
  getGymDetails, 
  getGymDashboard,
  getAllGyms,
  updateGymStatus 
} from '../controllers/gymController.js';
import {
  getGymPlans,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/planController.js';
import {
  getGymMembers,
  addMember,
  updateMemberStatus,
  deleteMember,
  getAvailableUsers
} from '../controllers/memberController.js';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  searchMembers,
  generateGymQR,
  getAttendanceHistory
} from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Gym owner routes
router.use(protect);
router.post('/', restrictTo('gym_owner'), createGym);
router.get('/dashboard', restrictTo('gym_owner'), getGymDashboard);
router.get('/details', restrictTo('gym_owner'), getGymDetails);
router.patch('/details/:id', restrictTo('gym_owner'), updateGymDetails);

// Plan management routes
router.get('/plans', restrictTo('gym_owner'), getGymPlans);
router.post('/plans', restrictTo('gym_owner'), createPlan);
router.patch('/plans/:id', restrictTo('gym_owner'), updatePlan);
router.delete('/plans/:id', restrictTo('gym_owner'), deletePlan);

// Member management routes
router.get('/members', restrictTo('gym_owner'), getGymMembers);
router.post('/members', restrictTo('gym_owner'), addMember);
router.patch('/members/:id/status', restrictTo('gym_owner'), updateMemberStatus);
router.delete('/members/:id', restrictTo('gym_owner'), deleteMember);
router.get('/users', restrictTo('gym_owner'), getAvailableUsers);

// Attendance routes (gym owner)
router.post('/attendance/checkin', restrictTo('gym_owner'), checkIn);
router.post('/attendance/checkout', restrictTo('gym_owner'), checkOut);
router.get('/attendance/today', restrictTo('gym_owner'), getTodayAttendance);
router.get('/attendance/history', restrictTo('gym_owner'), getAttendanceHistory);
router.get('/members/search', restrictTo('gym_owner'), searchMembers);
router.get('/attendance/gym-qr', restrictTo('gym_owner'), generateGymQR);

// Admin routes
router.get('/all', restrictTo('admin'), getAllGyms);
router.patch('/status/:id', restrictTo('admin'), updateGymStatus);

export default router;