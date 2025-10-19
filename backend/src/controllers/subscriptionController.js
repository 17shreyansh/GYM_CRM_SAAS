import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionService from '../services/SubscriptionService.js';

// Admin: Get all subscription plans
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create subscription plan
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { features, ...planData } = req.body;
    
    // Process features if it's a string
    const processedFeatures = typeof features === 'string' 
      ? features.split(',').map(f => f.trim()).filter(f => f)
      : features || [];
    
    const plan = new SubscriptionPlan({
      ...planData,
      features: processedFeatures
    });
    
    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update subscription plan
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { features, ...planData } = req.body;
    
    const processedFeatures = typeof features === 'string' 
      ? features.split(',').map(f => f.trim()).filter(f => f)
      : features || [];
    
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id, 
      { ...planData, features: processedFeatures }, 
      { new: true }
    );
    
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete subscription plan
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gym Owner: Get available plans
export const getAvailablePlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gym Owner: Create subscription order
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan_id } = req.body;
    const result = await SubscriptionService.createSubscriptionOrder(req.user._id, plan_id);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gym Owner: Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscription_id } = req.body;
    
    const result = await SubscriptionService.verifyAndActivateSubscription(subscription_id, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (req, res) => {
  try {
    const result = await SubscriptionService.checkSubscriptionStatus(req.user._id);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const result = await SubscriptionService.cancelSubscription(req.user._id);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};