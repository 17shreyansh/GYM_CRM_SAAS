import express from 'express';
import StaffInvitation from '../models/StaffInvitation.js';
import Staff from '../models/Staff.js';
import { authenticateToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Get user's invitations
router.get('/', authenticateToken, restrictTo('member'), async (req, res) => {
  try {
    const invitations = await StaffInvitation.find({ 
      user_id: req.user._id,
      status: 'pending',
      expires_at: { $gt: new Date() }
    }).populate('gym_id', 'gym_name gym_display_name location')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept invitation
router.post('/:id/accept', authenticateToken, restrictTo('member'), async (req, res) => {
  try {
    const invitation = await StaffInvitation.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      status: 'pending'
    });
    
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    
    if (invitation.expires_at < new Date()) {
      return res.status(400).json({ success: false, message: 'Invitation has expired' });
    }
    
    // Create staff record
    const staff = new Staff({
      gym_id: invitation.gym_id,
      user_id: invitation.user_id,
      role: invitation.role,
      title: invitation.title,
      department: invitation.department,
      salary: invitation.salary
    });
    
    await staff.save();
    
    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();
    
    res.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject invitation
router.post('/:id/reject', authenticateToken, restrictTo('member'), async (req, res) => {
  try {
    const invitation = await StaffInvitation.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );
    
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    
    res.json({ success: true, message: 'Invitation rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;