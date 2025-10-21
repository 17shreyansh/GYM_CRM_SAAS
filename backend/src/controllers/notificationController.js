import Notification from '../models/Notification.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';

// Create notification for gym members
export const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    
    // Get gym owned by current user
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Get all active members of this gym
    const members = await Member.find({ 
      gym: gym._id, 
      status: 'active' 
    }).populate('user');

    if (members.length === 0) {
      return res.status(400).json({ message: 'No active members found' });
    }

    // Create notifications for all members
    const notifications = members.map(member => ({
      recipient_id: member.user._id,
      recipient_type: 'member',
      gym_id: gym._id,
      title,
      message,
      type,
      category: 'system'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ 
      message: `Notification sent to ${members.length} members`,
      count: members.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient_id: req.user._id 
    })
    .populate('gym_id', 'gym_display_name gym_name')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient_id: req.user._id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient_id: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient_id: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};