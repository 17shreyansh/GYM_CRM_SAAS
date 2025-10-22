import express from 'express';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { authenticateToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Get all staff for a gym
router.get('/', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const Gym = (await import('../models/Gym.js')).default;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const staff = await Staff.find({ gym_id: gym._id })
      .populate('user_id', 'name email phone photo')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search users to add as staff
router.get('/search-users', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const { q } = req.query;
    const Gym = (await import('../models/Gym.js')).default;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const existingStaffIds = await Staff.find({ gym_id: gym._id, status: 'active' })
      .distinct('user_id');
    
    const users = await User.find({
      _id: { $nin: existingStaffIds },
      role: 'member',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    }).select('name email phone photo').limit(20);
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send staff invitation
router.post('/invite', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const { user_id, role, title, department, salary, message } = req.body;
    const Gym = (await import('../models/Gym.js')).default;
    const StaffInvitation = (await import('../models/StaffInvitation.js')).default;
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Check if user is already staff or has pending invitation
    const existingStaff = await Staff.findOne({ gym_id: gym._id, user_id, status: 'active' });
    const pendingInvitation = await StaffInvitation.findOne({ gym_id: gym._id, user_id, status: 'pending' });
    
    if (existingStaff) {
      return res.status(400).json({ success: false, message: 'User is already a staff member' });
    }
    if (pendingInvitation) {
      return res.status(400).json({ success: false, message: 'Invitation already sent to this user' });
    }
    
    const invitation = new StaffInvitation({
      gym_id: gym._id,
      user_id,
      role,
      title,
      department,
      salary,
      message
    });
    
    await invitation.save();
    await invitation.populate(['user_id', 'gym_id']);
    
    res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update staff member
router.put('/:id', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const Gym = (await import('../models/Gym.js')).default;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, gym_id: gym._id },
      req.body,
      { new: true }
    ).populate('user_id', 'name email phone photo');
    
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove staff member
router.delete('/:id', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const Gym = (await import('../models/Gym.js')).default;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, gym_id: gym._id },
      { status: 'inactive' },
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    
    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending invitations for gym
router.get('/invitations', authenticateToken, restrictTo('gym_owner'), async (req, res) => {
  try {
    const Gym = (await import('../models/Gym.js')).default;
    const StaffInvitation = (await import('../models/StaffInvitation.js')).default;
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const invitations = await StaffInvitation.find({ gym_id: gym._id })
      .populate('user_id', 'name email phone photo')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;