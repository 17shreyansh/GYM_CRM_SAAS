import mongoose from 'mongoose';
import Gym from '../src/models/Gym.js';

const fixPlanTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-saas');
    
    // Update all gyms with invalid plan_type values
    const result = await Gym.updateMany(
      { plan_type: { $regex: /monthly\s*/ } },
      { $set: { plan_type: 'basic' } }
    );
    
    console.log(`Updated ${result.modifiedCount} gyms with invalid plan_type`);
    
    // Set default for null/undefined plan_type
    const result2 = await Gym.updateMany(
      { plan_type: { $exists: false } },
      { $set: { plan_type: 'basic' } }
    );
    
    console.log(`Set default plan_type for ${result2.modifiedCount} gyms`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixPlanTypes();