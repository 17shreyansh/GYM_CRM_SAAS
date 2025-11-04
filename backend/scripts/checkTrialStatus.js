import mongoose from 'mongoose';
import Gym from '../src/models/Gym.js';
import dotenv from 'dotenv';

dotenv.config();

const checkTrialStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const gyms = await Gym.find({}).select('gym_name trial_status trial_start_date trial_end_date subscription_status');
    
    console.log('\n=== Current Gym Trial Status ===');
    
    if (gyms.length === 0) {
      console.log('No gyms found in database');
    } else {
      gyms.forEach(gym => {
        console.log(`\n🏋️ ${gym.gym_name}:`);
        console.log(`  Trial Status: ${gym.trial_status || 'Not set'}`);
        console.log(`  Subscription Status: ${gym.subscription_status || 'Not set'}`);
        
        if (gym.trial_end_date) {
          const daysLeft = Math.ceil((new Date(gym.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
          console.log(`  Trial Days Remaining: ${daysLeft}`);
          console.log(`  Trial End Date: ${gym.trial_end_date.toLocaleDateString()}`);
        }
      });
    }

  } catch (error) {
    console.error('Error checking trial status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkTrialStatus();