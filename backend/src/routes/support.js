import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

// Create ticket
router.post('/', protect, async (req, res) => {
  try {
    const { assignedTo, type, title, message } = req.body;
    const ticket = new SupportTicket({
      createdBy: req.user._id,
      assignedTo,
      type,
      title,
      messages: [{ sender: 'user', message }]
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
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const sender = req.user.role === 'admin' ? 'admin' : 'owner';
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { messages: { sender, message } },
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