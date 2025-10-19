import Member from '../models/Member.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';
import Plan from '../models/Plan.js';

// Get all members for gym owner
export const getGymMembers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    let query = { gym: gym._id };
    if (status) query.status = status;

    const members = await Member.find(query)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration')
      .sort({ createdAt: -1 });

    console.log('Found members:', members.length);
    console.log('Sample member:', members[0]);

    let filteredMembers = members;
    if (search) {
      filteredMembers = members.filter(member => 
        member.user.name.toLowerCase().includes(search.toLowerCase()) ||
        member.user.email.toLowerCase().includes(search.toLowerCase()) ||
        member._id.toString().includes(search)
      );
    }

    res.json({ success: true, members: filteredMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add member manually
export const addMember = async (req, res) => {
  try {
    const { userId, planId, joinMethod, paymentStatus } = req.body;
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    const member = new Member({
      user: userId,
      gym: gym._id,
      plan: planId,
      joinMethod,
      status: 'active',
      paymentStatus,
      startDate,
      endDate
    });

    await member.save();
    await member.populate('user', 'name email phone');
    await member.populate('plan', 'name price duration');
    
    res.status(201).json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Approve/reject join request
export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const member = await Member.findOne({ _id: id, gym: gym._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (status === 'active' && member.status === 'pending') {
      const plan = await Plan.findById(member.plan);
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
      
      member.startDate = startDate;
      member.endDate = endDate;
    }

    member.status = status;
    await member.save();
    await member.populate('user', 'name email phone');
    await member.populate('plan', 'name price duration');

    res.json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const member = await Member.findOneAndDelete({ _id: id, gym: gym._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users for adding as members
export const getAvailableUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'member' }).select('name email phone');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};