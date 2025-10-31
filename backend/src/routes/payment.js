import express from 'express';
import { protect } from '../middleware/auth.js';
import razorpay from '../utils/razorpay.js';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Gym from '../models/Gym.js';

const router = express.Router();

// Create payment order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { gymId, planId } = req.body;
    
    const plan = await Plan.findById(planId);
    const gym = await Gym.findById(gymId);
    
    const options = {
      amount: plan.price * 100, // amount in paise
      currency: 'INR',
      receipt: `ordiin_${gymId}_plan_${planId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gymId, planId } = req.body;
    
    // Verify signature (implement crypto verification)
    
    const plan = await Plan.findById(planId);
    const gym = await Gym.findById(gymId);
    
    // Calculate fees
    const adminFee = plan.price * (gym.commissionRate || 0.05);
    const gymPayout = plan.price - adminFee;
    
    // Create payment record
    const payment = new Payment({
      member: req.user._id,
      gym: gymId,
      amount: plan.price,
      source: 'razorpay',
      adminFee,
      gymPayout,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'completed'
    });
    
    await payment.save();
    
    // Update member status
    await Member.findOneAndUpdate(
      { user: req.user._id, gym: gymId, plan: planId },
      { 
        status: 'active',
        paymentStatus: 'paid',
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
      }
    );
    
    res.json({ success: true, paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;