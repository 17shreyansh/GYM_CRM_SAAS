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
  cancelSubscription
} from '../controllers/subscriptionController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.use(protect);
router.get('/admin/plans', restrictTo('admin'), getSubscriptionPlans);
router.post('/admin/plans', restrictTo('admin'), createSubscriptionPlan);
router.patch('/admin/plans/:id', restrictTo('admin'), updateSubscriptionPlan);
router.delete('/admin/plans/:id', restrictTo('admin'), deleteSubscriptionPlan);

// Gym owner routes
router.get('/plans', getAvailablePlans);
router.post('/create-order', restrictTo('gym_owner'), createSubscriptionOrder);
router.post('/verify-payment', restrictTo('gym_owner'), verifyPayment);
router.get('/status', restrictTo('gym_owner'), checkSubscriptionStatus);
router.post('/cancel', restrictTo('gym_owner'), cancelSubscription);

export default router;