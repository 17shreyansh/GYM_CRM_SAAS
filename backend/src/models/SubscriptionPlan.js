import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
  features: [String],
  member_limit: { type: Number, default: 0 }, // 0 = unlimited
  isActive: { type: Boolean, default: true },
  plan_id: { type: String, unique: true, required: true }
}, { timestamps: true });

subscriptionPlanSchema.pre('save', function(next) {
  if (!this.plan_id) {
    this.plan_id = 'PLAN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

subscriptionPlanSchema.pre('validate', function(next) {
  if (!this.plan_id) {
    this.plan_id = 'PLAN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);