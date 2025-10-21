import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import Gym from '../models/Gym.js';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import FileService from '../services/FileService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get approved gyms
router.get('/gyms', protect, async (req, res) => {
  try {
    const gyms = await Gym.find({ status: 'active' }).select('-payoutAccountId');
    const formattedGyms = gyms.map(gym => ({
      _id: gym._id,
      name: gym.gym_display_name || gym.gym_name,
      slug: (gym.gym_display_name || gym.gym_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      address: gym.registered_address,
      phone: gym.business_phone_number,
      logo: gym.gym_logo,
      description: gym.description,
      operatingHours: gym.opening_hours?.monday ? {
        open: gym.opening_hours.monday.open,
        close: gym.opening_hours.monday.close
      } : null
    }));
    res.json(formattedGyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gym details by slug
router.get('/gyms/:slug', protect, async (req, res) => {
  try {
    const gyms = await Gym.find({ status: 'active' }).select('-payoutAccountId');
    const gym = gyms.find(g => {
      const slug = (g.gym_display_name || g.gym_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return slug === req.params.slug;
    });
    
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    
    const formattedGym = {
      _id: gym._id,
      name: gym.gym_display_name || gym.gym_name,
      slug: (gym.gym_display_name || gym.gym_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      address: gym.registered_address,
      phone: gym.business_phone_number,
      logo: gym.gym_logo,
      description: gym.description,
      operatingHours: gym.opening_hours?.monday ? {
        open: gym.opening_hours.monday.open,
        close: gym.opening_hours.monday.close
      } : null
    };
    
    res.json(formattedGym);
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
      .populate('gym', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile photo
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const photoUrl = await FileService.uploadFile(req.file, `user_${req.user._id}`, 'profile');
    
    await User.findByIdAndUpdate(req.user._id, { photo: photoUrl });
    
    res.json({ 
      message: 'Photo uploaded successfully',
      photoUrl 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Renew membership
router.post('/renew/:membershipId', protect, async (req, res) => {
  try {
    const membership = await Member.findOne({
      _id: req.params.membershipId,
      user: req.user._id
    });
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    // This would typically integrate with payment system
    // For now, just return success
    res.json({ message: 'Renewal endpoint ready' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;