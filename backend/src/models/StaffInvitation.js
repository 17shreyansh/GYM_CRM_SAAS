import mongoose from 'mongoose';

const staffInvitationSchema = new mongoose.Schema({
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    enum: ['trainer', 'front_desk', 'nutritionist', 'manager', 'cleaner', 'maintenance'], 
    required: true 
  },
  title: { type: String, required: true },
  department: String,
  salary: Number,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: String,
  expires_at: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
}, { timestamps: true });

export default mongoose.model('StaffInvitation', staffInvitationSchema);