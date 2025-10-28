import Gym from '../models/Gym.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';

class TrialService {
  // Start trial subscription
  static async startTrial(userId) {
    try {
      const gym = await Gym.findOne({ owner_user_id: userId });
      if (!gym) {
        return { success: false, error: 'Gym not found' };
      }

      // Check if trial is available
      if (gym.trial_status !== 'available') {
        return { success: false, error: 'Trial not available or already used' };
      }

      // Get trial plan (create default if doesn't exist)
      let trialPlan = await SubscriptionPlan.findOne({ is_trial: true });
      if (!trialPlan) {
        trialPlan = await SubscriptionPlan.create({
          name: 'Free Trial',
          price: 0,
          duration: 30,
          features: ['Full gym management access', 'Unlimited members', 'Complete analytics', 'All features included'],
          member_limit: 0, // 0 = unlimited
          is_trial: true,
          trial_duration: 30,
          isActive: true
        });
      }

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialStartDate.getDate() + trialPlan.trial_duration);

      // Create subscription record
      const subscription = await Subscription.create({
        gym_id: gym._id,
        plan_id: trialPlan._id,
        status: 'active',
        start_date: trialStartDate,
        end_date: trialEndDate,
        amount: 0,
        payment_status: 'paid'
      });

      // Update gym with trial info
      await Gym.findByIdAndUpdate(gym._id, {
        trial_status: 'active',
        trial_start_date: trialStartDate,
        trial_end_date: trialEndDate,
        subscription_status: 'trial',
        subscription_id: subscription._id,
        subscription_plan: trialPlan._id,
        subscription_end_date: trialEndDate
      });

      return {
        success: true,
        message: 'Trial started successfully',
        trial: {
          start_date: trialStartDate,
          end_date: trialEndDate,
          duration: trialPlan.trial_duration
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check trial status
  static async checkTrialStatus(userId) {
    try {
      const gym = await Gym.findOne({ owner_user_id: userId });
      if (!gym) {
        return { success: false, error: 'Gym not found' };
      }

      const now = new Date();
      let trialStatus = gym.trial_status;

      // Auto-expire trial if time has passed
      if (gym.trial_status === 'active' && gym.trial_end_date && now > gym.trial_end_date) {
        await Gym.findByIdAndUpdate(gym._id, {
          trial_status: 'expired',
          subscription_status: 'expired'
        });
        trialStatus = 'expired';
      }

      return {
        success: true,
        trial_status: trialStatus,
        trial_start_date: gym.trial_start_date,
        trial_end_date: gym.trial_end_date,
        days_remaining: gym.trial_end_date ? Math.max(0, Math.ceil((gym.trial_end_date - now) / (1000 * 60 * 60 * 24))) : 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin: Get all gyms with trial info
  static async getAllTrialInfo() {
    try {
      const gyms = await Gym.find({})
        .populate('owner_user_id', 'name email')
        .select('gym_name trial_status trial_start_date trial_end_date subscription_status')
        .sort({ createdAt: -1 });

      return { success: true, gyms };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin: Reset trial for a gym
  static async resetTrial(gymId) {
    try {
      await Gym.findByIdAndUpdate(gymId, {
        trial_status: 'available',
        trial_start_date: null,
        trial_end_date: null
      });

      return { success: true, message: 'Trial reset successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin: Extend trial
  static async extendTrial(gymId, additionalDays) {
    try {
      const gym = await Gym.findById(gymId);
      if (!gym) {
        return { success: false, error: 'Gym not found' };
      }

      if (gym.trial_status !== 'active') {
        return { success: false, error: 'Trial is not active' };
      }

      const newEndDate = new Date(gym.trial_end_date);
      newEndDate.setDate(newEndDate.getDate() + additionalDays);

      await Gym.findByIdAndUpdate(gymId, {
        trial_end_date: newEndDate,
        subscription_end_date: newEndDate
      });

      return { success: true, message: `Trial extended by ${additionalDays} days` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default TrialService;