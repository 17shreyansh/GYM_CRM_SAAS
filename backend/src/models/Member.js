import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  joinMethod: { type: String, enum: ['online', 'cash'], required: true },
  status: { type: String, enum: ['pending', 'active', 'rejected', 'suspended'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  startDate: Date,
  endDate: Date,
  attendanceCount: { type: Number, default: 0 },
  
  // Offline member fields
  isOfflineMember: { type: Boolean, default: false },
  offlineDetails: {
    name: String,
    phone: String,
    email: String,
    address: String,
    emergencyContact: String,
    dateOfBirth: Date,
    healthInfo: String
  },
  
  // Custom plan fields
  customPlan: {
    isCustom: { type: Boolean, default: false },
    name: String,
    price: Number,
    duration: Number, // in days
    description: String
  },
  
  // Payment history
  paymentHistory: [{
    status: { type: String, enum: ['paid', 'unpaid'] },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }]
}, { timestamps: true });

// Validation to ensure either user or offline details exist
memberSchema.pre('save', function(next) {
  if (!this.user && !this.isOfflineMember) {
    return next(new Error('Either user reference or offline member details required'));
  }
  if (this.isOfflineMember && (!this.offlineDetails.name || !this.offlineDetails.phone)) {
    return next(new Error('Name and phone are required for offline members'));
  }
  if (!this.plan && !this.customPlan.isCustom) {
    return next(new Error('Either plan reference or custom plan details required'));
  }
  next();
});

export default mongoose.model('Member', memberSchema);