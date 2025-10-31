import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Gym from '../src/models/Gym.js';

dotenv.config();

const endTrialForGym = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user with username "17shreyansh00"
    const user = await User.findOne({ username: '17shreyansh00' });
    
    if (!user) {
      console.log('User with username "17shreyansh00" not found');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Find the gym owned by this user
    const gym = await Gym.findOne({ owner_user_id: user._id });
    
    if (!gym) {
      console.log('No gym found for this user');
      return;
    }

    console.log(`Found gym: ${gym.gym_name} (${gym.gym_id})`);
    console.log(`Current trial status: ${gym.trial_status}`);
    console.log(`Current subscription status: ${gym.subscription_status}`);

    // Update the gym to end the trial
    const updatedGym = await Gym.findByIdAndUpdate(
      gym._id,
      {
        trial_status: 'expired',
        subscription_status: 'inactive',
        trial_end_date: new Date()
      },
      { new: true }
    );

    console.log('✅ Trial ended successfully!');
    console.log(`Updated trial status: ${updatedGym.trial_status}`);
    console.log(`Updated subscription status: ${updatedGym.subscription_status}`);
    console.log(`Trial end date: ${updatedGym.trial_end_date}`);

  } catch (error) {
    console.error('Error ending trial:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

endTrialForGym();