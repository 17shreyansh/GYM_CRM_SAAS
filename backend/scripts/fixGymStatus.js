import mongoose from 'mongoose';
import Gym from '../src/models/Gym.js';

const fixGymStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-saas');
    
    // Update all gyms with old status values to 'active'
    const result = await Gym.updateMany(
      { status: { $in: ['pending', 'approved', 'rejected'] } },
      { $set: { status: 'active' } }
    );
    
    console.log(`Updated ${result.modifiedCount} gyms with invalid status`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixGymStatus();