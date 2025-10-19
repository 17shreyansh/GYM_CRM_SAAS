import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: String, required: true }, // 'admin' or gymId
  type: { type: String, enum: ['bug', 'payment', 'account', 'other'], required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  title: { type: String, required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'admin', 'owner'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);