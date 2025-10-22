import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    enum: ['trainer', 'front_desk', 'nutritionist', 'manager', 'cleaner', 'maintenance'], 
    required: true 
  },
  title: { type: String, required: true }, // Custom title like "Senior Trainer", "Head Nutritionist"
  department: String,
  hire_date: { type: Date, default: Date.now },
  salary: Number,
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  permissions: [{
    module: String, // 'members', 'plans', 'payments', 'reports'
    access: { type: String, enum: ['read', 'write', 'admin'], default: 'read' }
  }],
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    start_time: String,
    end_time: String,
    break_start: String,
    break_end: String
  }],
  emergency_contact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String
}, { timestamps: true });

// Compound index to ensure one user can't have multiple active roles in same gym
staffSchema.index({ gym_id: 1, user_id: 1, status: 1 });

export default mongoose.model('Staff', staffSchema);