import mongoose from 'mongoose';
import Member from '../src/models/Member.js';

const fixMemberJoinMethod = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-saas');
    
    // Update all members with old joinMethod values
    const result1 = await Member.updateMany(
      { joinMethod: 'online' },
      { $set: { joinMethod: 'qr' } }
    );
    
    const result2 = await Member.updateMany(
      { joinMethod: 'cash' },
      { $set: { joinMethod: 'manual' } }
    );
    
    const result3 = await Member.updateMany(
      { joinMethod: { $nin: ['qr', 'manual'] } },
      { $set: { joinMethod: 'manual' } }
    );
    
    const totalUpdated = result1.modifiedCount + result2.modifiedCount + result3.modifiedCount;
    
    console.log(`Updated ${totalUpdated} members with invalid joinMethod`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixMemberJoinMethod();