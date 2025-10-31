import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Gym from '../src/models/Gym.js';
import Plan from '../src/models/Plan.js';

dotenv.config();

const seedGym = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create gym owner user
    const gymOwner = new User({
      name: 'John Smith',
      email: 'gym.owner@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+91-9876543210',
      role: 'gym_owner',
      isVerified: true
    });
    await gymOwner.save();

    // Create gym
    const gym = new Gym({
      gym_name: 'FitZone Gym',
      owner_full_name: 'John Smith',
      business_email: 'gym.owner@example.com',
      business_phone_number: '+91-9876543210',
      registered_address: '123 Fitness Street, Gym City, GC 12345',
      gym_display_name: 'FitZone Premium Fitness',
      description: 'Modern fitness center with state-of-the-art equipment',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        pin: '400001'
      },
      opening_hours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '07:00', close: '21:00', closed: false },
        sunday: { open: '08:00', close: '20:00', closed: false }
      },
      amenities_list: ['Cardio Equipment', 'Weight Training', 'Personal Training', 'Locker Rooms', 'Parking'],
      services_offered: ['Fitness Training', 'Weight Loss Programs', 'Strength Training', 'Yoga Classes'],
      payment_settings: {
        upi_id: 'fitzone@paytm',
        payment_instructions: 'Scan QR code and pay. Upload payment screenshot with transaction ID.',
        manual_approval: true
      },
      owner_user_id: gymOwner._id,
      status: 'active'
    });
    await gym.save();

    // Create membership plans
    const plans = [
      {
        name: 'Monthly Basic',
        description: 'Access to gym equipment and basic facilities',
        price: 1500,
        duration: 30,
        features: ['Gym Access', 'Locker Facility'],
        gym: gym._id,
        isActive: true
      },
      {
        name: 'Quarterly Premium',
        description: 'Full access with personal training sessions',
        price: 4000,
        duration: 90,
        features: ['Gym Access', 'Personal Training', 'Diet Consultation', 'Locker Facility'],
        gym: gym._id,
        isActive: true
      },
      {
        name: 'Annual VIP',
        description: 'Complete fitness package with all amenities',
        price: 15000,
        duration: 365,
        features: ['Unlimited Gym Access', 'Personal Training', 'Diet Consultation', 'Yoga Classes', 'Priority Booking'],
        gym: gym._id,
        isActive: true
      }
    ];

    for (const planData of plans) {
      const plan = new Plan(planData);
      await plan.save();
    }

    console.log('✅ Gym seeded successfully!');
    console.log('📧 Gym Owner Email:', gymOwner.email);
    console.log('🔑 Password: password');
    console.log('🏋️ Gym Name:', gym.gym_display_name);
    console.log('📍 Location:', gym.location.city);
    console.log('💳 Plans Created:', plans.length);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedGym();