import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  razorpay_subscription_id: String,
  razorpay_payment_id: String,
  status: { type: String, enum: ['active', 'cancelled', 'expired', 'pending'], default: 'pending' },
  start_date: { type: Date, default: Date.now },
  end_date: Date,
  amount: { type: Number, required: true },
  payment_status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);