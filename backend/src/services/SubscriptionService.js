import Subscription from '../models/Subscription.js';
import Gym from '../models/Gym.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import RazorpayService from './RazorpayService.js';

class SubscriptionService {
  async createSubscriptionOrder(userId, planId) {
    try {
      console.log('Creating subscription order for user:', userId, 'plan:', planId);
      const gym = await Gym.findOne({ owner_user_id: userId });
      const plan = await SubscriptionPlan.findById(planId);

      console.log('Found gym:', !!gym, 'Found plan:', !!plan);
      if (!gym) throw new Error('Gym not found');
      if (!plan) throw new Error('Plan not found');

      // Handle free plan
      if (plan.price === 0) {
        return await this.activateFreeSubscription(gym, plan);
      }

      // Create Razorpay order for paid plan
      const orderResult = await RazorpayService.createOrder({
        amount: plan.price,
        receipt: `sub_${Date.now().toString().slice(-10)}`,
        notes: {
          gym_id: gym._id.toString(),
          plan_id: plan._id.toString(),
          plan_name: plan.name
        }
      });

      if (!orderResult.success) {
        throw new Error(`Payment order creation failed: ${orderResult.error}`);
      }

      // Create pending subscription
      const subscription = new Subscription({
        gym_id: gym._id,
        plan_id: plan._id,
        amount: plan.price,
        razorpay_subscription_id: orderResult.order.id,
        status: 'pending',
        payment_status: 'pending'
      });

      await subscription.save();

      return {
        success: true,
        order: orderResult.order,
        subscription,
        razorpay_key: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Subscription service error:', error);
      return { success: false, error: error.message };
    }
  }

  async activateFreeSubscription(gym, plan) {
    const subscription = new Subscription({
      gym_id: gym._id,
      plan_id: plan._id,
      status: 'active',
      amount: 0,
      payment_status: 'paid',
      start_date: new Date(),
      end_date: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
    });

    await subscription.save();
    await this.updateGymSubscription(gym._id, subscription, plan);

    return { success: true, subscription, free_plan: true };
  }

  async verifyAndActivateSubscription(subscriptionId, paymentData) {
    try {
      const subscription = await Subscription.findById(subscriptionId).populate('plan_id');
      if (!subscription) throw new Error('Subscription not found');

      // Verify payment signature
      const verificationResult = await RazorpayService.verifyPayment(paymentData);
      if (!verificationResult.success) {
        throw new Error(`Payment verification failed: ${verificationResult.error}`);
      }

      if (!verificationResult.isAuthentic) {
        throw new Error('Invalid payment signature');
      }

      // Get payment details from Razorpay
      const paymentResult = await RazorpayService.getPaymentDetails(paymentData.razorpay_payment_id);
      if (!paymentResult.success) {
        throw new Error(`Failed to fetch payment details: ${paymentResult.error}`);
      }

      // Update subscription
      subscription.razorpay_payment_id = paymentData.razorpay_payment_id;
      subscription.status = 'active';
      subscription.payment_status = 'paid';
      subscription.start_date = new Date();
      subscription.end_date = new Date(Date.now() + subscription.plan_id.duration * 24 * 60 * 60 * 1000);
      
      await subscription.save();
      await this.updateGymSubscription(subscription.gym_id, subscription, subscription.plan_id);

      return { success: true, subscription, payment: paymentResult.payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateGymSubscription(gymId, subscription, plan) {
    await Gym.findByIdAndUpdate(gymId, {
      subscription_status: 'active',
      plan_type: plan.name.toLowerCase(),
      subscription_id: subscription._id,
      subscription_plan: plan._id,
      subscription_end_date: subscription.end_date
    });
  }

  async checkSubscriptionStatus(userId) {
    try {
      const gym = await Gym.findOne({ owner_user_id: userId })
        .populate('subscription_id')
        .populate('subscription_plan');

      if (!gym) return { success: false, error: 'Gym not found' };

      const subscription = gym.subscription_id;
      if (!subscription) {
        return { success: true, status: 'no_subscription', gym };
      }

      // Check if expired
      if (subscription.end_date && new Date() > subscription.end_date) {
        await Gym.findByIdAndUpdate(gym._id, { subscription_status: 'expired' });
        await Subscription.findByIdAndUpdate(subscription._id, { status: 'expired' });
        return { success: true, status: 'expired', gym, subscription };
      }

      return { success: true, status: subscription.status, gym, subscription };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancelSubscription(userId) {
    try {
      const gym = await Gym.findOne({ owner_user_id: userId });
      if (!gym) throw new Error('Gym not found');

      const subscription = await Subscription.findOne({
        gym_id: gym._id,
        status: 'active'
      });

      if (!subscription) throw new Error('No active subscription found');

      subscription.status = 'cancelled';
      await subscription.save();

      await Gym.findByIdAndUpdate(gym._id, { subscription_status: 'cancelled' });

      return { success: true, subscription };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new SubscriptionService();