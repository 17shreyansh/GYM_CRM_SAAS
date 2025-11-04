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
  extendTrial,
  forceStartTrial,
  pauseTrial,
  resumeTrial,
  forceExpireTrial,
  bulkTrialOperation
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
router.post('/admin/trials/:gymId/force-start', restrictTo('admin'), forceStartTrial);
router.post('/admin/trials/:gymId/pause', restrictTo('admin'), pauseTrial);
router.post('/admin/trials/:gymId/resume', restrictTo('admin'), resumeTrial);
router.post('/admin/trials/:gymId/force-expire', restrictTo('admin'), forceExpireTrial);
router.post('/admin/trials/bulk', restrictTo('admin'), bulkTrialOperation);

// Gym owner routes
router.get('/plans', getAvailablePlans);
router.post('/create-order', restrictTo('gym_owner'), createSubscriptionOrder);
router.post('/verify-payment', restrictTo('gym_owner'), verifyPayment);
router.get('/status', restrictTo('gym_owner'), checkSubscriptionStatus);
router.post('/cancel', restrictTo('gym_owner'), cancelSubscription);
router.post('/start-trial', restrictTo('gym_owner'), startTrial);
router.get('/trial-status', restrictTo('gym_owner'), checkTrialStatus);

export default router;