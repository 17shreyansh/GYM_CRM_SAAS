import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  // A. Permanent / Core Identity (non-editable)
  gym_id: { type: String, unique: true, required: true },
  gym_name: { type: String, required: true }, // Official name
  owner_full_name: { type: String, required: true },
  business_email: { type: String, required: true, unique: true },
  business_phone_number: { type: String, required: true },
  registered_address: { type: String, required: true },
  gst_number: String,
  pan_number: String,
  business_number: String,
  bank_details: {
    account_holder_name: String,
    account_number: String,
    bank_name: String,
    ifsc_code: String,
    branch_name: String
  },
  plan_type: { 
    type: String, 
    default: 'basic',
    set: function(value) {
      return value ? value.toString().trim().toLowerCase() : 'basic';
    }
  },
  subscription_id: String,
  
  // B. Editable / Dynamic Details
  gym_display_name: String, // Frontend display name
  gym_logo: String,
  banner_images: [String],
  description: String,
  about: String,
  opening_hours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  location: {
    city: String,
    state: String,
    pin: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  amenities_list: [String],
  trainers_list: [{
    name: String,
    specialization: [String],
    experience: Number,
    photo: String,
    bio: String
  }],
  services_offered: [String],
  gallery_images: [String],
  social_media_links: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    website: String
  },
  booking_options: {
    walk_in: { type: Boolean, default: true },
    online: { type: Boolean, default: true }
  },
  
  // Payment Settings
  payment_settings: {
    qr_code_image: String, // QR code image URL
    upi_id: String,
    payment_instructions: String,
    manual_approval: { type: Boolean, default: true }
  },
  
  // System / Internal Fields
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  subscription_status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'], default: 'inactive' },
  subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  subscription_plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  subscription_end_date: Date,
  trial_status: { type: String, enum: ['available', 'active', 'expired', 'used', 'paused'], default: 'available' },
  trial_start_date: Date,
  trial_end_date: Date,
  last_login: Date,
  payoutAccountId: String,
  commissionRate: { type: Number, default: 0.05 },
  supportTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket' }],
  
  // Analytics fields
  analytics: {
    total_visitors: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    active_members: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Pre-save middleware to generate gym_id
gymSchema.pre('save', function(next) {
  if (!this.gym_id) {
    this.gym_id = 'GYM_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

// Also handle pre-validate to ensure gym_id is set before validation
gymSchema.pre('validate', function(next) {
  if (!this.gym_id) {
    this.gym_id = 'GYM_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model('Gym', gymSchema);