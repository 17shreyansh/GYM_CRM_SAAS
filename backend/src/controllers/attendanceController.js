import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';

// Check-in member (manual by admin or QR by member)
export const checkIn = async (req, res) => {
  try {
    const { memberId, isManual = true } = req.body;
    
    let gym, member;
    
    if (isManual && req.user.role === 'gym_owner') {
      // Manual check-in by gym owner
      gym = await Gym.findOne({ owner_user_id: req.user._id });
      if (!gym) {
        return res.status(404).json({ success: false, message: 'Gym not found' });
      }
      member = await Member.findOne({ _id: memberId, gym: gym._id, status: 'active' })
        .populate('user', 'name email');
    } else {
      // QR check-in by member
      member = await Member.findOne({ user: req.user._id, status: 'active' })
        .populate('user', 'name email')
        .populate('gym');
      if (member) {
        gym = member.gym;
      }
    }

    if (!member) {
      return res.status(404).json({ success: false, message: 'Active membership not found' });
    }

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({ member: member._id, date: today });

    if (existingAttendance && !existingAttendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (existingAttendance && existingAttendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already completed attendance for today' });
    }

    const attendance = new Attendance({
      member: member._id,
      gym: gym._id,
      date: today,
      checkInMethod: isManual ? 'manual' : 'qr'
    });

    await attendance.save();
    member.attendanceCount = (member.attendanceCount || 0) + 1;
    await member.save();

    res.json({ success: true, attendance, member: member.user });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check-out member
export const checkOut = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    let query;
    if (req.user.role === 'gym_owner') {
      const gym = await Gym.findOne({ owner_user_id: req.user._id });
      if (!gym) {
        return res.status(404).json({ success: false, message: 'Gym not found' });
      }
      query = { member: memberId, gym: gym._id };
    } else {
      // Member checking out themselves
      const member = await Member.findOne({ user: req.user._id, status: 'active' });
      if (!member) {
        return res.status(404).json({ success: false, message: 'Active membership not found' });
      }
      query = { member: member._id };
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ 
      ...query,
      date: today,
      checkOutTime: { $exists: false }
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active check-in found' });
    }

    const checkOutTime = new Date();
    const duration = Math.round((checkOutTime - attendance.checkInTime) / (1000 * 60));

    attendance.checkOutTime = checkOutTime;
    attendance.duration = duration;
    await attendance.save();

    res.json({ success: true, attendance, duration });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate gym QR code for gym owner
export const generateGymQR = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const qrData = {
      gymId: gym._id,
      gymName: gym.gym_name,
      type: 'gym_checkin'
    };

    res.json({ success: true, qrData, gym: gym.gym_name });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Member scans gym QR to check-in
export const scanGymQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const parsedQR = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    if (parsedQR.type !== 'gym_checkin') {
      return res.status(400).json({ success: false, message: 'Invalid QR code' });
    }

    // Check gym working hours (6 AM to 10 PM)
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      return res.status(400).json({ success: false, message: 'Gym is closed. Check-in only available during working hours (6 AM - 10 PM).' });
    }

    const member = await Member.findOne({ 
      user: req.user._id, 
      gym: parsedQR.gymId, 
      status: 'active' 
    }).populate('user', 'name email');
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Active membership not found for this gym' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({ member: member._id, date: today });

    if (existingAttendance && !existingAttendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (existingAttendance && existingAttendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already completed attendance for today' });
    }

    const attendance = new Attendance({
      member: member._id,
      gym: parsedQR.gymId,
      date: today,
      checkInMethod: 'qr'
    });

    await attendance.save();
    member.attendanceCount += 1;
    await member.save();

    res.json({ success: true, attendance, member: member.user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res) => {
  try {
    let gym;
    if (req.user.role === 'gym_owner') {
      gym = await Gym.findOne({ owner_user_id: req.user._id });
    } else {
      const member = await Member.findOne({ user: req.user._id, status: 'active' });
      if (member) {
        gym = await Gym.findById(member.gym);
      }
    }
    
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ gym: gym._id, date: today })
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ checkInTime: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get member's own attendance
export const getMyAttendance = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user._id, status: 'active' })
      .populate('gym', 'gym_name');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Active membership not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({ member: member._id, date: today });
    
    res.json({ 
      success: true, 
      todayAttendance,
      gym: member.gym,
      canCheckIn: !todayAttendance || todayAttendance.checkOutTime,
      canCheckOut: todayAttendance && !todayAttendance.checkOutTime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance history with date and member search
export const getAttendanceHistory = async (req, res) => {
  try {
    const { date, search } = req.query;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    let query = { gym: gym._id };
    if (date) {
      query.date = date;
    }

    let attendance = await Attendance.find(query)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ checkInTime: -1 });

    if (search) {
      attendance = attendance.filter(record => 
        record.member.user.name.toLowerCase().includes(search.toLowerCase()) ||
        record.member.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search members for check-in
export const searchMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    let query = { 
      gym: gym._id, 
      status: 'active',
      endDate: { $gte: new Date() }
    };

    // If search query exists, add search conditions
    if (search) {
      const members = await Member.find(query).populate('user', 'name email phone');
      const filteredMembers = members.filter(member => 
        member.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        member._id.toString().includes(search)
      );
      return res.json({ success: true, members: filteredMembers, total: filteredMembers.length });
    }

    // If no search, return paginated results
    const skip = (page - 1) * limit;
    const members = await Member.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Member.countDocuments(query);

    res.json({ 
      success: true, 
      members, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};