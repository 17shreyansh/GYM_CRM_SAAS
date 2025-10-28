import express from 'express';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAvailablePlans,
  createSubscriptionOrder,
  verifyPayment,
  checkSubscriptionStatus,
  cancelSubscription,
  startTrial,
  checkTrialStatus,
  getAllTrialInfo,
  resetTrial,
  extendTrial
} from '../controllers/subscriptionController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.use(protect);
router.get('/admin/plans', restrictTo('admin'), getSubscriptionPlans);
router.post('/admin/plans', restrictTo('admin'), createSubscriptionPlan);
router.patch('/admin/plans/:id', restrictTo('admin'), updateSubscriptionPlan);
router.delete('/admin/plans/:id', restrictTo('admin'), deleteSubscriptionPlan);
router.get('/admin/trials', restrictTo('admin'), getAllTrialInfo);
router.post('/admin/trials/:gymId/reset', restrictTo('admin'), resetTrial);
router.post('/admin/trials/:gymId/extend', restrictTo('admin'), extendTrial);

// Gym owner routes
router.get('/plans', getAvailablePlans);
router.post('/create-order', restrictTo('gym_owner'), createSubscriptionOrder);
router.post('/verify-payment', restrictTo('gym_owner'), verifyPayment);
router.get('/status', restrictTo('gym_owner'), checkSubscriptionStatus);
router.post('/cancel', restrictTo('gym_owner'), cancelSubscription);
router.post('/start-trial', restrictTo('gym_owner'), startTrial);
router.get('/trial-status', restrictTo('gym_owner'), checkTrialStatus);

export default router;