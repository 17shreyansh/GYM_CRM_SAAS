import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: String, required: true }, // 'admin' or gymId
  type: { type: String, enum: ['bug', 'payment', 'account', 'membership', 'other'], required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  title: { type: String, required: true },
  attachments: [{
    filename: String,
    url: String,
    type: { type: String, enum: ['image', 'video'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  messages: [{
    sender: { type: String, enum: ['user', 'admin', 'owner'], required: true },
    message: { type: String, required: true },
    attachments: [{
      filename: String,
      url: String,
      type: { type: String, enum: ['image', 'video'] },
      uploadedAt: { type: Date, default: Date.now }
    }],
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);