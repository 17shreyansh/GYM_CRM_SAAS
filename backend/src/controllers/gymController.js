import Gym from '../models/Gym.js';
import User from '../models/User.js';

// Create gym with comprehensive data
export const createGym = async (req, res) => {
  try {
    const {
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gst_number,
      pan_number,
      business_number,
      plan_type = 'basic'
    } = req.body;

    const gym = new Gym({
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gst_number,
      pan_number,
      business_number,
      plan_type,
      owner_user_id: req.user._id,
      gym_display_name: gym_name // Default to gym_name
    });

    await gym.save();
    res.status(201).json({ success: true, gym });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update editable gym details
export const updateGymDetails = async (req, res) => {
  try {
    const gymId = req.params.id;
    const updateData = req.body;
    
    // Remove non-editable fields
    const nonEditableFields = ['gym_id', 'gym_name', 'owner_full_name', 'business_email', 
      'business_phone_number', 'registered_address', 'gst_number', 'pan_number', 
      'business_number', 'plan_type', 'subscription_id', 'owner_user_id', 'verified', 
      'status', 'subscription_status', 'createdAt', 'updatedAt'];
    
    nonEditableFields.forEach(field => delete updateData[field]);

    const gym = await Gym.findOneAndUpdate(
      { _id: gymId, owner_user_id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get gym details
export const getGymDetails = async (req, res) => {
  try {
    const gym = await Gym.findOne({ 
      owner_user_id: req.user._id 
    }).populate('owner_user_id', 'name email');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gym dashboard data
export const getGymDashboard = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    // Update last_login
    gym.last_login = new Date();
    await gym.save();

    const dashboardData = {
      gym_info: {
        gym_id: gym.gym_id,
        gym_display_name: gym.gym_display_name || gym.gym_name,
        status: gym.status,
        verified: gym.verified,
        subscription_status: gym.subscription_status
      },
      analytics: gym.analytics,
      recent_activity: {
        last_login: gym.last_login,
        total_trainers: gym.trainers_list?.length || 0,
        services_count: gym.services_offered?.length || 0
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all gyms (for admin)
export const getAllGyms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    
    const gyms = await Gym.find(filter)
      .populate('owner_user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gym.countDocuments(filter);

    res.json({
      success: true,
      gyms,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: gyms.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gym status (admin only)
export const updateGymStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const gym = await Gym.findByIdAndUpdate(
      id,
      { status, verified: status === 'approved' },
      { new: true }
    ).populate('owner_user_id', 'name email');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};