import mongoose from 'mongoose';
import Gym from '../src/models/Gym.js';
import User from '../src/models/User.js';
import TrialService from '../src/services/TrialService.js';
import dotenv from 'dotenv';

dotenv.config();

const startTrialsForExistingGyms = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find gyms that don't have trial status set or have available trial
    const gyms = await Gym.find({
      $or: [
        { trial_status: { $exists: false } },
        { trial_status: null },
        { trial_status: 'available' }
      ]
    }).populate('owner_user_id', 'name email');

    console.log(`Found ${gyms.length} gyms that need trial activation`);

    for (const gym of gyms) {
      try {
        console.log(`Starting trial for gym: ${gym.gym_name} (Owner: ${gym.owner_user_id?.name})`);
        
        const result = await TrialService.startTrial(gym.owner_user_id._id);
        
        if (result.success) {
          console.log(`✅ Trial started successfully for ${gym.gym_name}`);
        } else {
          console.log(`❌ Failed to start trial for ${gym.gym_name}: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Error starting trial for ${gym.gym_name}: ${error.message}`);
      }
    }

    console.log('Completed trial activation for existing gyms');

  } catch (error) {
    console.error('Error starting trials for existing gyms:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

startTrialsForExistingGyms();