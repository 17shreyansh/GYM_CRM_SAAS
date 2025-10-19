import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  amount: { type: Number, required: true },
  source: { type: String, enum: ['razorpay', 'cash'], required: true },
  adminFee: Number,
  gymPayout: Number,
  payoutStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);