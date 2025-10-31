import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  amount: { type: Number, required: true },
  source: { type: String, enum: ['razorpay', 'cash', 'qr_manual'], required: true },
  adminFee: Number,
  gymPayout: Number,
  payoutStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  
  // Manual payment fields
  paymentProof: {
    image: String,
    transaction_id: String,
    payment_date: Date,
    notes: String
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationDate: Date,
  
  status: { type: String, enum: ['pending', 'completed', 'failed', 'pending_verification'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);