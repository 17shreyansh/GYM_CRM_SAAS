import Gym from '../models/Gym.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

// Create gym with comprehensive data
export const createGym = async (req, res) => {
  try {
    // Check if user already has a gym
    const existingGym = await Gym.findOne({ owner_user_id: req.user._id });
    if (existingGym) {
      return res.status(400).json({ success: false, message: 'You already have a gym registered' });
    }

    const {
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gym_display_name,
      description,
      location,
      amenities_list,
      opening_hours,
      gst_number,
      pan_number,
      business_number,
      plan_type = 'basic'
    } = req.body;

    // Validate required fields
    if (!gym_name || !owner_full_name || !business_email || !business_phone_number || !registered_address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: gym_name, owner_full_name, business_email, business_phone_number, registered_address' 
      });
    }

    // Process opening hours to convert time strings
    let processedHours = {};
    if (opening_hours) {
      Object.keys(opening_hours).forEach(day => {
        const dayData = opening_hours[day];
        processedHours[day] = {
          open: dayData.open || null,
          close: dayData.close || null,
          closed: dayData.closed || false
        };
      });
    }

    const gym = new Gym({
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gym_display_name: gym_display_name || gym_name,
      description,
      location,
      amenities_list: amenities_list || [],
      opening_hours: processedHours,
      gst_number,
      pan_number,
      business_number,
      plan_type: (plan_type || 'basic').trim().toLowerCase(),
      owner_user_id: req.user._id,
      status: 'active'
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
    
    // Remove non-editable fields (plan_type can be edited by admin)
    const nonEditableFields = ['gym_id', 'gym_name', 'owner_full_name', 'business_email', 
      'business_phone_number', 'registered_address', 'gst_number', 'pan_number', 
      'business_number', 'subscription_id', 'owner_user_id', 'verified', 
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

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      gym_id: gym._id
    }).sort({ createdAt: -1 }).populate('plan_id');

    let subscriptionData = {
      plan_name: 'No Plan',
      days_remaining: 0,
      end_date: null,
      status: 'expired'
    };

    if (currentSubscription) {
      const now = new Date();
      const endDate = new Date(currentSubscription.end_date);
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      subscriptionData = {
        plan_name: currentSubscription.plan_id?.name || 'Unknown Plan',
        days_remaining: daysRemaining,
        end_date: currentSubscription.end_date,
        status: daysRemaining > 0 ? 'active' : 'expired'
      };

      // Auto-update gym subscription status if expired
      if (daysRemaining <= 0 && gym.subscription_status !== 'expired') {
        gym.subscription_status = 'expired';
        await gym.save();
      }
    }

    gym.last_login = new Date();
    await gym.save();

    const dashboardData = {
      gym_info: {
        gym_id: gym.gym_id || 'N/A',
        gym_display_name: gym.gym_display_name || gym.gym_name,
        status: gym.status,
        subscription_status: subscriptionData.status
      },
      subscription: subscriptionData,
      analytics: gym.analytics || {
        active_members: 0,
        total_visitors: 0,
        total_revenue: 0
      },
      recent_activity: {
        last_login: gym.last_login,
        total_trainers: gym.trainers_list?.length || 0,
        services_count: gym.services_offered?.length || 0
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
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

// Get gym subscription history
export const getGymSubscriptions = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const subscriptions = await Subscription.find({ gym_id: gym._id })
      .populate('plan_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, subscriptions });
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
      { status },
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