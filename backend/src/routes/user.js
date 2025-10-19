import express from 'express';
import { protect } from '../middleware/auth.js';
import Gym from '../models/Gym.js';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';

const router = express.Router();

// Get approved gyms
router.get('/gyms', protect, async (req, res) => {
  try {
    const gyms = await Gym.find({ status: 'approved' }).select('-payoutAccountId');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gym plans
router.get('/gyms/:id/plans', protect, async (req, res) => {
  try {
    const plans = await Plan.find({ gym: req.params.id, isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join gym
router.post('/join', protect, async (req, res) => {
  try {
    const { gymId, planId, joinMethod } = req.body;
    
    const existingMember = await Member.findOne({
      user: req.user._id,
      gym: gymId,
      status: { $in: ['active', 'pending'] }
    });
    
    if (existingMember) {
      return res.status(400).json({ message: 'Already a member or request pending' });
    }

    const member = new Member({
      user: req.user._id,
      gym: gymId,
      plan: planId,
      joinMethod,
      status: joinMethod === 'cash' ? 'pending' : 'active'
    });

    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user memberships
router.get('/memberships', protect, async (req, res) => {
  try {
    const memberships = await Member.find({ user: req.user._id })
      .populate('gym', 'name')
      .populate('plan', 'name price duration');
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user payments
router.get('/payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.user._id })
      .populate('gym', 'name');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;