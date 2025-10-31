import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, restrictTo } from '../middleware/auth.js';
import SupportTicket from '../models/SupportTicket.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/support/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

const router = express.Router();

// Create ticket
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { assignedTo, type, title, message } = req.body;
    
    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/support/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video'
    })) : [];
    
    const ticket = new SupportTicket({
      createdBy: req.user._id,
      assignedTo,
      type,
      title,
      attachments,
      messages: [{ 
        sender: 'user', 
        message,
        attachments: attachments
      }]
    });
    
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user tickets
router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tickets (admin)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('createdBy', 'name email role');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to ticket
router.post('/:id/reply', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { message } = req.body;
    const sender = req.user.role === 'admin' ? 'admin' : 'owner';
    
    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/support/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video'
    })) : [];
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { messages: { sender, message, attachments } },
        status: 'in_progress'
      },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;