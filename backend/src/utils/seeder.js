import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Gym from '../models/Gym.js';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import Analytics from '../models/Analytics.js';
import Notification from '../models/Notification.js';
import { connectDB } from './database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Drop database to clear all data and indexes
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️ Database dropped successfully');
    
    // Clear existing data (redundant after drop but kept for safety)
    await User.deleteMany({});
    await Gym.deleteMany({});
    await Plan.deleteMany({});
    await Member.deleteMany({});
    await Trainer.deleteMany({});
    await Analytics.deleteMany({});
    await Notification.deleteMany({});

    // Create admin user (password will be hashed by pre-save middleware)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gymsaas.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create gym owners
    const gymOwner1 = await User.create({
      name: 'John Doe',
      email: 'john@fitnesshub.com',
      password: 'owner123',
      role: 'gym_owner',
      phone: '+91-9876543210'
    });

    const gymOwner2 = await User.create({
      name: 'Sarah Wilson',
      email: 'sarah@powerzone.com',
      password: 'owner123',
      role: 'gym_owner',
      phone: '+91-9876543211'
    });

    // Create member users
    const member1 = await User.create({
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'member123',
      role: 'member',
      phone: '+91-9876543212'
    });

    const member2 = await User.create({
      name: 'Lisa Chen',
      email: 'lisa@example.com',
      password: 'member123',
      role: 'member',
      phone: '+91-9876543213'
    });

    // Create gyms
    const gym1 = await Gym.create({
      gym_id: 'GYM_' + Date.now() + '_FH',
      gym_name: 'Fitness Hub Pvt Ltd',
      gym_display_name: 'Fitness Hub',
      owner_full_name: 'John Doe',
      business_email: 'business@fitnesshub.com',
      business_phone_number: '+91-9876543210',
      registered_address: '123 Main Street, Mumbai, Maharashtra 400001',
      gst_number: '27ABCDE1234F1Z5',
      pan_number: 'ABCDE1234F',
      plan_type: 'premium',
      owner_user_id: gymOwner1._id,
      description: 'Premium fitness center with state-of-the-art equipment',
      about: 'We are committed to helping you achieve your fitness goals with our modern facilities and expert trainers.',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        pin: '400001',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      amenities_list: ['AC', 'Steam', 'Cardio', 'Weights', 'Pool', 'Parking'],
      services_offered: ['Personal Training', 'Group Classes', 'Yoga', 'Zumba', 'Nutrition Counseling'],
      opening_hours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '07:00', close: '21:00', closed: false },
        sunday: { open: '08:00', close: '20:00', closed: false }
      },
      social_media_links: {
        facebook: 'https://facebook.com/fitnesshub',
        instagram: 'https://instagram.com/fitnesshub',
        website: 'https://fitnesshub.com'
      },
      status: 'active',
      analytics: {
        total_visitors: 1250,
        total_revenue: 125000,
        active_members: 85
      }
    });

    const gym2 = await Gym.create({
      gym_id: 'GYM_' + (Date.now() + 1) + '_PZ',
      gym_name: 'Power Zone Fitness Pvt Ltd',
      gym_display_name: 'Power Zone',
      owner_full_name: 'Sarah Wilson',
      business_email: 'business@powerzone.com',
      business_phone_number: '+91-9876543211',
      registered_address: '456 Park Avenue, Delhi, Delhi 110001',
      gst_number: '07FGHIJ5678K2L6',
      pan_number: 'FGHIJ5678K',
      plan_type: 'basic',
      owner_user_id: gymOwner2._id,
      description: 'Strength training focused gym',
      about: 'Specializing in powerlifting and strength training with experienced coaches.',
      location: {
        city: 'Delhi',
        state: 'Delhi',
        pin: '110001',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      amenities_list: ['AC', 'Weights', 'Cardio', 'Parking'],
      services_offered: ['Personal Training', 'Powerlifting', 'Strength Training'],
      opening_hours: {
        monday: { open: '05:30', close: '23:00', closed: false },
        tuesday: { open: '05:30', close: '23:00', closed: false },
        wednesday: { open: '05:30', close: '23:00', closed: false },
        thursday: { open: '05:30', close: '23:00', closed: false },
        friday: { open: '05:30', close: '23:00', closed: false },
        saturday: { open: '06:00', close: '22:00', closed: false },
        sunday: { open: '07:00', close: '21:00', closed: false }
      },
      status: 'active',
      analytics: {
        total_visitors: 650,
        total_revenue: 65000,
        active_members: 45
      }
    });

    // Create membership plans
    const plan1 = await Plan.create({
      gym: gym1._id,
      name: 'Monthly Premium',
      description: 'Full access to all facilities and classes',
      price: 2500,
      duration: 30
    });

    const plan2 = await Plan.create({
      gym: gym1._id,
      name: 'Quarterly Premium',
      description: 'Full access for 3 months with discount',
      price: 6500,
      duration: 90
    });

    const plan3 = await Plan.create({
      gym: gym2._id,
      name: 'Monthly Basic',
      description: 'Access to gym equipment',
      price: 1500,
      duration: 30
    });

    // Create trainers
    await Trainer.create([
      {
        gym_id: gym1._id,
        name: 'Alex Rodriguez',
        email: 'alex@fitnesshub.com',
        phone: '+91-9876543214',
        specialization: ['Weight Training', 'Cardio', 'Nutrition'],
        experience: 5,
        bio: 'Certified personal trainer with 5 years of experience',
        hourly_rate: 1500,
        rating: 4.8,
        total_reviews: 45
      },
      {
        gym_id: gym2._id,
        name: 'Emma Wilson',
        email: 'emma@powerzone.com',
        phone: '+91-9876543215',
        specialization: ['Powerlifting', 'Strength Training'],
        experience: 7,
        bio: 'Former competitive powerlifter and certified strength coach',
        hourly_rate: 2000,
        rating: 4.9,
        total_reviews: 32
      }
    ]);

    // Create member relationships
    await Member.create([
      {
        user: member1._id,
        gym: gym1._id,
        plan: plan1._id,
        joinMethod: 'online',
        status: 'active',
        paymentStatus: 'paid',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        user: member2._id,
        gym: gym2._id,
        plan: plan3._id,
        joinMethod: 'cash',
        status: 'pending',
        paymentStatus: 'unpaid'
      }
    ]);

    // Create sample analytics data
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await Analytics.create({
        gym_id: gym1._id,
        date: date,
        metrics: {
          daily_visitors: Math.floor(Math.random() * 50) + 20,
          new_members: Math.floor(Math.random() * 5),
          revenue_generated: Math.floor(Math.random() * 5000) + 2000
        },
        member_retention: {
          active_members: 85 + Math.floor(Math.random() * 10) - 5,
          churned_members: Math.floor(Math.random() * 2),
          retention_rate: 0.95 + Math.random() * 0.05
        }
      });
    }

    // Create sample notifications
    await Notification.create([
      {
        recipient_id: member1._id,
        recipient_type: 'member',
        gym_id: gym1._id,
        title: 'Welcome to Fitness Hub!',
        message: 'Welcome to our gym! We are excited to have you as a member. Feel free to explore all our facilities.',
        type: 'success',
        category: 'system'
      },
      {
        recipient_id: member1._id,
        recipient_type: 'member',
        gym_id: gym1._id,
        title: 'New Equipment Arrival',
        message: 'We have added new cardio machines to our gym. Come check them out!',
        type: 'info',
        category: 'system'
      },
      {
        recipient_id: member2._id,
        recipient_type: 'member',
        gym_id: gym2._id,
        title: 'Membership Approval Pending',
        message: 'Your membership request is under review. You will be notified once approved.',
        type: 'warning',
        category: 'membership'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@gymsaas.com / admin123');
    console.log('Gym Owner 1: john@fitnesshub.com / owner123');
    console.log('Gym Owner 2: sarah@powerzone.com / owner123');
    console.log('Member 1: mike@example.com / member123');
    console.log('Member 2: lisa@example.com / member123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();