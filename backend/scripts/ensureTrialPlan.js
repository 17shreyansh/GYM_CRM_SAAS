import mongoose from 'mongoose';
import SubscriptionPlan from '../src/models/SubscriptionPlan.js';
import dotenv from 'dotenv';

dotenv.config();

const ensureTrialPlan = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if trial plan already exists
    const existingTrialPlan = await SubscriptionPlan.findOne({ is_trial: true });
    
    if (existingTrialPlan) {
      console.log('Trial plan already exists:', existingTrialPlan.name);
      return;
    }

    // Create trial plan
    const trialPlan = await SubscriptionPlan.create({
      name: 'Free Trial',
      price: 0,
      duration: 30,
      features: [
        'Full gym management access',
        'Unlimited members',
        'Complete analytics & reports',
        'Member check-in/out',
        'Plan management',
        'Staff management',
        'All portal features',
        'Priority support'
      ],
      member_limit: 0, // unlimited
      is_trial: true,
      trial_duration: 30,
      isActive: true
    });

    console.log('Trial plan created successfully:', trialPlan);

  } catch (error) {
    console.error('Error ensuring trial plan:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

ensureTrialPlan();