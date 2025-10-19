import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: [String],
  experience: { type: Number, required: true }, // in years
  photo: String,
  bio: String,
  certifications: [String],
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    start_time: String,
    end_time: String
  }],
  hourly_rate: Number,
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Trainer', trainerSchema);