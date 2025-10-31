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

    let filteredMembers = members;
    if (search) {
      filteredMembers = members.filter(member => {
        const searchLower = search.toLowerCase();
        if (member.isOfflineMember) {
          return member.offlineDetails.name?.toLowerCase().includes(searchLower) ||
                 member.offlineDetails.phone?.includes(search) ||
                 member.offlineDetails.email?.toLowerCase().includes(searchLower) ||
                 member._id.toString().includes(search);
        } else {
          return member.user?.name?.toLowerCase().includes(searchLower) ||
                 member.user?.email?.toLowerCase().includes(searchLower) ||
                 member._id.toString().includes(search);
        }
      });
    }

    res.json({ success: true, members: filteredMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add member manually
export const addMember = async (req, res) => {
  try {
    const { 
      memberType, // 'online' or 'offline'
      userId, 
      planType, // 'predefined' or 'custom'
      planId, 
      joinMethod, 
      paymentStatus,
      offlineDetails,
      customPlan
    } = req.body;
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    let planDuration, planPrice;
    
    // Handle plan details
    if (planType === 'custom') {
      if (!customPlan || !customPlan.name || !customPlan.price || !customPlan.duration) {
        return res.status(400).json({ success: false, message: 'Custom plan details are required' });
      }
      planDuration = customPlan.duration;
      planPrice = customPlan.price;
    } else {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }
      planDuration = plan.duration;
      planPrice = plan.price;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (planDuration * 24 * 60 * 60 * 1000));

    const memberData = {
      gym: gym._id,
      joinMethod,
      status: 'active',
      paymentStatus,
      startDate,
      endDate
    };

    // Handle offline vs online member
    if (memberType === 'offline') {
      if (!offlineDetails || !offlineDetails.name || !offlineDetails.phone) {
        return res.status(400).json({ success: false, message: 'Name and phone are required for offline members' });
      }
      memberData.isOfflineMember = true;
      memberData.offlineDetails = offlineDetails;
    } else {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required for online members' });
      }
      memberData.user = userId;
    }

    // Handle custom vs predefined plan
    if (planType === 'custom') {
      memberData.customPlan = {
        isCustom: true,
        ...customPlan
      };
    } else {
      memberData.plan = planId;
    }

    const member = new Member(memberData);
    await member.save();
    
    // Populate based on member type
    if (!member.isOfflineMember) {
      await member.populate('user', 'name email phone');
    }
    if (member.plan) {
      await member.populate('plan', 'name price duration');
    }
    
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
      let planDuration;
      if (member.customPlan.isCustom) {
        planDuration = member.customPlan.duration;
      } else {
        const plan = await Plan.findById(member.plan);
        planDuration = plan.duration;
      }
      
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (planDuration * 24 * 60 * 60 * 1000));
      
      member.startDate = startDate;
      member.endDate = endDate;
    }

    member.status = status;
    await member.save();
    
    if (!member.isOfflineMember) {
      await member.populate('user', 'name email phone');
    }
    if (member.plan) {
      await member.populate('plan', 'name price duration');
    }

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

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, notes } = req.body;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const member = await Member.findOne({ _id: id, gym: gym._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Add to payment history
    member.paymentHistory.push({
      status: paymentStatus,
      updatedAt: new Date(),
      updatedBy: req.user._id,
      notes: notes || `Payment status updated to ${paymentStatus}`
    });

    member.paymentStatus = paymentStatus;
    await member.save();

    if (!member.isOfflineMember) {
      await member.populate('user', 'name email phone');
    }
    if (member.plan) {
      await member.populate('plan', 'name price duration');
    }

    res.json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get member profile with analytics
export const getMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const member = await Member.findOne({ _id: id, gym: gym._id })
      .populate('user', 'name email phone dateOfBirth photo healthInfo')
      .populate('plan', 'name price duration description');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Get attendance data
    const { default: Attendance } = await import('../models/Attendance.js');
    const attendanceRecords = await Attendance.find({ member: member._id })
      .sort({ checkInTime: -1 })
      .limit(30);

    // Calculate analytics
    const totalAttendance = attendanceRecords.length;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyAttendance = attendanceRecords.filter(a => new Date(a.checkInTime) >= thisMonth).length;
    
    const avgDuration = attendanceRecords.length > 0 
      ? Math.round(attendanceRecords.reduce((sum, a) => sum + (a.duration || 0), 0) / attendanceRecords.length)
      : 0;

    const lastVisit = attendanceRecords.length > 0 ? attendanceRecords[0].checkInTime : null;
    
    // Days since joining
    const daysSinceJoining = member.startDate 
      ? Math.floor((new Date() - new Date(member.startDate)) / (1000 * 60 * 60 * 24))
      : 0;

    // Days until expiry
    const daysUntilExpiry = member.endDate 
      ? Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    const analytics = {
      totalAttendance,
      monthlyAttendance,
      avgDuration,
      lastVisit,
      daysSinceJoining,
      daysUntilExpiry,
      attendanceRate: daysSinceJoining > 0 ? Math.round((totalAttendance / daysSinceJoining) * 100) : 0
    };

    res.json({ 
      success: true, 
      member, 
      analytics,
      attendanceRecords: attendanceRecords.slice(0, 10) // Last 10 records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send notification to member
export const sendMemberNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type = 'info' } = req.body;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const member = await Member.findOne({ _id: id, gym: gym._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Only send to online members (who have user accounts)
    if (member.isOfflineMember) {
      return res.status(400).json({ success: false, message: 'Cannot send notifications to offline members' });
    }

    const { default: Notification } = await import('../models/Notification.js');
    const notification = new Notification({
      recipient_id: member.user,
      recipient_type: 'member',
      gym_id: gym._id,
      title,
      message,
      type,
      category: 'membership'
    });

    await notification.save();
    res.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};