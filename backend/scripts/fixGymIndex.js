import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixGymIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('gyms');
    
    // Drop the problematic username index
    try {
      await collection.dropIndex('username_1');
      console.log('Dropped username_1 index from gyms collection');
    } catch (error) {
      console.log('Index username_1 does not exist or already dropped');
    }
    
    console.log('Index fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixGymIndex();