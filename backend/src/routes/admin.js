import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import Gym from '../models/Gym.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', protect, restrictTo('admin'), async (req, res) => {
  try {
    const totalGyms = await Gym.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'member' });
    const pendingGyms = await Gym.countDocuments({ status: 'pending' });
    const activeGyms = await Gym.countDocuments({ status: 'approved' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$adminFee' } } }
    ]);

    res.json({
      totalGyms,
      totalUsers,
      pendingGyms,
      activeGyms,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gym management
router.get('/gyms', protect, restrictTo('admin'), async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner', 'name email');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/gyms/:id/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const gym = await Gym.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status
router.patch('/users/:id/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gym details
router.get('/gyms/:id/details', protect, restrictTo('admin'), async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('owner', 'name email');
    const members = await Member.find({ gym: req.params.id }).populate('user', 'name email');
    const payments = await Payment.find({ gym: req.params.id });
    const totalRevenue = payments.reduce((sum, p) => sum + p.adminFee, 0);
    
    res.json({ ...gym.toObject(), members, memberCount: members.length, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revenue analytics
router.get('/analytics/revenue', protect, restrictTo('admin'), async (req, res) => {
  try {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const revenueData = await Promise.all(
      last7Days.map(async (date) => {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const revenue = await Payment.aggregate([
          { $match: { createdAt: { $gte: startDate, $lt: endDate }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$adminFee' } } }
        ]);
        
        return { date, revenue: revenue[0]?.total || 0 };
      })
    );
    
    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;