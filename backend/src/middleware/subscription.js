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

    // Check if gym is suspended
    if (gym.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        message: 'Gym is suspended by admin',
        gym_suspended: true 
      });
    }

    // Check if subscription or trial is active
    const hasActiveSubscription = gym.subscription_id && gym.subscription_status === 'active' && gym.plan_type !== 'basic';
    const hasActiveTrial = gym.trial_status === 'active' && gym.trial_end_date && new Date() < new Date(gym.trial_end_date);
    const hasTrialPaused = gym.trial_status === 'paused';
    
    if (!hasActiveSubscription && !hasActiveTrial) {
      // Check if trial has expired
      if (gym.trial_status === 'active' && gym.trial_end_date && new Date() >= new Date(gym.trial_end_date)) {
        await Gym.findByIdAndUpdate(gym._id, { 
          trial_status: 'expired',
          subscription_status: 'expired' 
        });
        return res.status(403).json({ 
          success: false, 
          message: 'Trial period expired. Please subscribe to continue.',
          trial_expired: true 
        });
      }
      
      // Check if trial is paused
      if (hasTrialPaused) {
        return res.status(403).json({ 
          success: false, 
          message: 'Trial is currently paused by admin. Please contact support.',
          trial_paused: true 
        });
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Active subscription or trial required to access gym features',
        subscription_required: true,
        current_plan: gym.plan_type || 'none'
      });
    }

    // Check if paid subscription has expired (trial expiry handled above)
    if (hasActiveSubscription && gym.subscription_end_date && new Date() > gym.subscription_end_date) {
      await Gym.findByIdAndUpdate(gym._id, { subscription_status: 'expired' });
      return res.status(403).json({ 
        success: false, 
        message: 'Subscription expired',
        subscription_expired: true 
      });
    }

    // Add trial info to request
    req.gym = gym;
    req.isTrialUser = hasActiveTrial;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};