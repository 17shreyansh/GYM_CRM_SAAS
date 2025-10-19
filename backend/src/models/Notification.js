import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient_type: { type: String, enum: ['admin', 'gym_owner', 'member'], required: true },
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  category: { type: String, enum: ['booking', 'payment', 'membership', 'system', 'promotion'], required: true },
  read: { type: Boolean, default: false },
  action_url: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);