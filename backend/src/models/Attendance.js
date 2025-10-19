import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: Date,
  date: { type: String, required: true }, // YYYY-MM-DD format
  duration: Number, // in minutes
  checkInMethod: { type: String, enum: ['manual', 'qr'], default: 'manual' }
}, { timestamps: true });

attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);