import Gym from '../models/Gym.js';
import Subscription from '../models/Subscription.js';

export const checkSubscription = async (req, res, next) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id })
      .populate('subscription_id')
      .populate('subscription_plan');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    // Check if subscription exists and is active
    if (!gym.subscription_id || gym.subscription_status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'No active subscription',
        subscription_required: true 
      });
    }

    // Check if subscription has expired
    if (gym.subscription_end_date && new Date() > gym.subscription_end_date) {
      // Update status to expired
      await Gym.findByIdAndUpdate(gym._id, { subscription_status: 'expired' });
      return res.status(403).json({ 
        success: false, 
        message: 'Subscription expired',
        subscription_expired: true 
      });
    }

    req.gym = gym;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};