import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  joinMethod: { type: String, enum: ['online', 'cash'], required: true },
  status: { type: String, enum: ['pending', 'active', 'rejected', 'suspended'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  startDate: Date,
  endDate: Date,
  attendanceCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);