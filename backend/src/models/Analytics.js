import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  date: { type: Date, required: true },
  metrics: {
    daily_visitors: { type: Number, default: 0 },
    new_members: { type: Number, default: 0 },
    revenue_generated: { type: Number, default: 0 },
    peak_hours: [{
      hour: Number,
      visitor_count: Number
    }]
  },
  member_retention: {
    active_members: Number,
    churned_members: Number,
    retention_rate: Number
  }
}, { timestamps: true });

// Compound index for efficient querying
analyticsSchema.index({ gym_id: 1, date: 1 }, { unique: true });

export default mongoose.model('Analytics', analyticsSchema);