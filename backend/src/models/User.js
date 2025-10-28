import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, default: undefined },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  dateOfBirth: Date,
  photo: String,
  role: { type: String, enum: ['admin', 'gym_owner', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  healthInfo: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);