import express from 'express';
import { 
  createGym, 
  updateGymDetails, 
  getGymDetails, 
  getGymDashboard,
  getAllGyms,
  updateGymStatus,
  getGymSubscriptions 
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
  getAvailableUsers,
  updatePaymentStatus,
  getMemberProfile,
  sendMemberNotification
} from '../controllers/memberController.js';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  searchMembers,
  generateGymQR,
  getAttendanceHistory
} from '../controllers/attendanceController.js';
import {
  createNotification
} from '../controllers/notificationController.js';
import {
  getPaymentSettings,
  updatePaymentSettings,
  getPaymentRequests,
  verifyPayment
} from '../controllers/gymController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/subscription.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Gym owner routes
router.use(protect);
router.post('/', restrictTo('gym_owner'), upload.single('qr_code'), createGym);
router.get('/dashboard', restrictTo('gym_owner'), getGymDashboard);
router.get('/details', restrictTo('gym_owner'), getGymDetails);
router.patch('/details/:id', restrictTo('gym_owner'), upload.single('qr_code'), updateGymDetails);
router.get('/subscriptions', restrictTo('gym_owner'), getGymSubscriptions);

// Plan management routes
router.get('/plans', restrictTo('gym_owner'), checkSubscription, getGymPlans);
router.post('/plans', restrictTo('gym_owner'), checkSubscription, createPlan);
router.patch('/plans/:id', restrictTo('gym_owner'), checkSubscription, updatePlan);
router.delete('/plans/:id', restrictTo('gym_owner'), checkSubscription, deletePlan);

// Member management routes
router.get('/members', restrictTo('gym_owner'), checkSubscription, getGymMembers);
router.post('/members', restrictTo('gym_owner'), checkSubscription, addMember);
router.get('/members/:id/profile', restrictTo('gym_owner'), checkSubscription, getMemberProfile);
router.patch('/members/:id/status', restrictTo('gym_owner'), checkSubscription, updateMemberStatus);
router.patch('/members/:id/payment', restrictTo('gym_owner'), checkSubscription, updatePaymentStatus);
router.post('/members/:id/notify', restrictTo('gym_owner'), checkSubscription, sendMemberNotification);
router.delete('/members/:id', restrictTo('gym_owner'), checkSubscription, deleteMember);
router.get('/users', restrictTo('gym_owner'), checkSubscription, getAvailableUsers);

// Attendance routes (gym owner)
router.post('/attendance/checkin', restrictTo('gym_owner'), checkSubscription, checkIn);
router.post('/attendance/checkout', restrictTo('gym_owner'), checkSubscription, checkOut);
router.get('/attendance/today', restrictTo('gym_owner'), checkSubscription, getTodayAttendance);
router.get('/attendance/history', restrictTo('gym_owner'), checkSubscription, getAttendanceHistory);
router.get('/members/search', restrictTo('gym_owner'), checkSubscription, searchMembers);
router.get('/attendance/gym-qr', restrictTo('gym_owner'), checkSubscription, generateGymQR);

// Payment QR routes
router.get('/payment-settings', restrictTo('gym_owner'), checkSubscription, getPaymentSettings);
router.post('/payment-settings', restrictTo('gym_owner'), checkSubscription, updatePaymentSettings);
router.get('/payment-requests', restrictTo('gym_owner'), checkSubscription, getPaymentRequests);
router.patch('/payment-requests/:id/verify', restrictTo('gym_owner'), checkSubscription, verifyPayment);

// Notification routes
router.post('/notifications', restrictTo('gym_owner'), checkSubscription, createNotification);

// Admin routes
router.get('/all', restrictTo('admin'), getAllGyms);
router.patch('/status/:id', restrictTo('admin'), updateGymStatus);

export default router;