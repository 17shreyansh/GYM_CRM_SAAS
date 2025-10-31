import Gym from '../models/Gym.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';

// Create gym with comprehensive data
export const createGym = async (req, res) => {
  try {
    // Check if user already has a gym
    const existingGym = await Gym.findOne({ owner_user_id: req.user._id });
    if (existingGym) {
      return res.status(400).json({ success: false, message: 'You already have a gym registered', gym: existingGym });
    }

    const {
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gym_display_name,
      description,
      location,
      amenities_list,
      opening_hours,
      gst_number,
      pan_number,
      business_number,
      bank_details,
      payment_qr_code,
      plan_type = 'basic'
    } = req.body;

    // Validate required fields
    if (!gym_name || !owner_full_name || !business_email || !business_phone_number || !registered_address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: gym_name, owner_full_name, business_email, business_phone_number, registered_address' 
      });
    }

    // Process opening hours to convert time strings
    let processedHours = {};
    if (opening_hours) {
      Object.keys(opening_hours).forEach(day => {
        const dayData = opening_hours[day];
        processedHours[day] = {
          open: dayData.open || null,
          close: dayData.close || null,
          closed: dayData.closed || false
        };
      });
    }

    // Handle payment QR code upload - will save after gym creation
    let qrCodeUrl = payment_qr_code || '';
    let hasQRFile = !!req.file;

    const gym = new Gym({
      gym_name,
      owner_full_name,
      business_email,
      business_phone_number,
      registered_address,
      gym_display_name: gym_display_name || gym_name,
      description,
      location,
      amenities_list: amenities_list || [],
      opening_hours: processedHours,
      gst_number,
      pan_number,
      business_number,
      bank_details,
      payment_settings: {
        qr_code_image: hasQRFile ? `/uploads/gyms/temp/payment_qr.jpg` : qrCodeUrl,
        manual_approval: true
      },
      plan_type: (plan_type || 'basic').trim().toLowerCase(),
      owner_user_id: req.user._id,
      status: 'active'
    });

    await gym.save();
    
    // Save payment QR code file with proper gym ID
    if (hasQRFile && req.file) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      
      const gymDir = path.join(__dirname, '../../uploads/gyms', gym._id.toString());
      if (!fs.existsSync(gymDir)) {
        fs.mkdirSync(gymDir, { recursive: true });
      }
      
      const fileName = 'payment_qr.jpg';
      const filePath = path.join(gymDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update gym with correct payment QR code path
      gym.payment_settings.qr_code_image = `/uploads/gyms/${gym._id}/${fileName}`;
      await gym.save();
    }

    res.status(201).json({ success: true, gym });
  } catch (error) {
    console.error('Gym creation error:', error);
    let message = 'Failed to create gym';
    let statusCode = 400;
    
    if (error.code === 11000) {
      if (error.keyPattern?.business_email) {
        message = 'This business email is already registered with another gym.';
      } else if (error.keyPattern?.gym_id) {
        message = 'Gym ID conflict. Please try again.';
      } else {
        message = 'This gym information is already registered.';
      }
    } else if (error.name === 'ValidationError') {
      message = Object.values(error.errors)[0]?.message || 'Please check your gym details';
    }
    
    res.status(statusCode).json({ success: false, message });
  }
};

// Update editable gym details
export const updateGymDetails = async (req, res) => {
  try {
    const gymId = req.params.id;
    const updateData = req.body;
    
    // For initial setup, allow updating core fields
    const isInitialSetup = req.query.initial_setup === 'true';
    
    if (!isInitialSetup) {
      // Remove non-editable fields for regular updates
      const nonEditableFields = ['gym_id', 'gym_name', 'owner_full_name', 'business_email', 
        'business_phone_number', 'registered_address', 'gst_number', 'pan_number', 
        'business_number', 'subscription_id', 'owner_user_id', 'verified', 
        'status', 'subscription_status', 'createdAt', 'updatedAt'];
      
      nonEditableFields.forEach(field => delete updateData[field]);
    }

    // Handle payment QR code upload
    if (req.file) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      
      const uploadDir = path.join(__dirname, '../../uploads/gyms', gymId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = 'payment_qr.jpg';
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update payment settings with new QR code path
      if (!updateData.payment_settings) {
        updateData.payment_settings = {};
      }
      updateData.payment_settings.qr_code_image = `/uploads/gyms/${gymId}/${fileName}`;
    }

    const gym = await Gym.findOneAndUpdate(
      { _id: gymId, owner_user_id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get gym details
export const getGymDetails = async (req, res) => {
  try {
    const gym = await Gym.findOne({ 
      owner_user_id: req.user._id 
    }).populate('owner_user_id', 'name email');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gym dashboard data (basic access without subscription check)
export const getGymDashboard = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    // Check subscription status but don't block access
    const hasActiveSubscription = gym.subscription_id && gym.subscription_status === 'active' && gym.plan_type !== 'basic';
    
    if (!hasActiveSubscription) {
      // Return limited dashboard data for users without subscription
      return res.json({
        success: true,
        data: {
          gym_info: {
            gym_id: gym.gym_id || 'N/A',
            gym_display_name: gym.gym_display_name || gym.gym_name,
            status: gym.status,
            subscription_status: 'inactive'
          },
          subscription: {
            plan_name: 'No Plan',
            days_remaining: 0,
            end_date: null,
            status: 'expired'
          },
          analytics: {
            active_members: 0,
            total_visitors: 0,
            total_revenue: 0
          },
          subscription_required: true
        }
      });
    }

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      gym_id: gym._id
    }).sort({ createdAt: -1 }).populate('plan_id');

    let subscriptionData = {
      plan_name: 'No Plan',
      days_remaining: 0,
      end_date: null,
      status: 'expired'
    };

    if (currentSubscription) {
      const now = new Date();
      const endDate = new Date(currentSubscription.end_date);
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      subscriptionData = {
        plan_name: currentSubscription.plan_id?.name || 'Unknown Plan',
        days_remaining: daysRemaining,
        end_date: currentSubscription.end_date,
        status: daysRemaining > 0 ? 'active' : 'expired'
      };

      // Auto-update gym subscription status if expired
      if (daysRemaining <= 0 && gym.subscription_status !== 'expired') {
        gym.subscription_status = 'expired';
        await gym.save();
      }
    }

    gym.last_login = new Date();
    await gym.save();

    const dashboardData = {
      gym_info: {
        gym_id: gym.gym_id || 'N/A',
        gym_display_name: gym.gym_display_name || gym.gym_name,
        status: gym.status,
        subscription_status: subscriptionData.status
      },
      subscription: subscriptionData,
      analytics: gym.analytics || {
        active_members: 0,
        total_visitors: 0,
        total_revenue: 0
      },
      recent_activity: {
        last_login: gym.last_login,
        total_trainers: gym.trainers_list?.length || 0,
        services_count: gym.services_offered?.length || 0
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all gyms (for admin)
export const getAllGyms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    
    const gyms = await Gym.find(filter)
      .populate('owner_user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gym.countDocuments(filter);

    res.json({
      success: true,
      gyms,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: gyms.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gym subscription history
export const getGymSubscriptions = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const subscriptions = await Subscription.find({ gym_id: gym._id })
      .populate('plan_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gym status (admin only)
export const updateGymStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const gym = await Gym.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('owner_user_id', 'name email');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, gym });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get payment settings
export const getPaymentSettings = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ 
      success: true, 
      payment_settings: gym.payment_settings || {
        qr_code_image: null,
        upi_id: '',
        payment_instructions: '',
        manual_approval: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment settings
export const updatePaymentSettings = async (req, res) => {
  try {
    const { qr_code_image, upi_id, payment_instructions, manual_approval } = req.body;
    
    const gym = await Gym.findOneAndUpdate(
      { owner_user_id: req.user._id },
      { 
        payment_settings: {
          qr_code_image,
          upi_id,
          payment_instructions,
          manual_approval: manual_approval !== false
        }
      },
      { new: true }
    );

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.json({ success: true, payment_settings: gym.payment_settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get payment requests
export const getPaymentRequests = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }


    
    const paymentRequests = await Payment.find({
      gym: gym._id,
      source: 'qr_manual',
      status: 'pending_verification'
    })
    .populate('member', 'user isOfflineMember offlineDetails')
    .populate({
      path: 'member',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 });

    res.json({ success: true, payment_requests: paymentRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'approved' or 'rejected'
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }


    
    const payment = await Payment.findOne({ _id: id, gym: gym._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    if (status === 'approved') {
      payment.status = 'completed';
      payment.verifiedBy = req.user._id;
      payment.verificationDate = new Date();
      
      // Update member status
      const member = await Member.findById(payment.member);
      if (member) {
        member.status = 'active';
        member.paymentStatus = 'paid';
        
        // Set membership dates
        let planDuration;
        if (member.customPlan?.isCustom) {
          planDuration = member.customPlan.duration;
        } else {
          const plan = await Plan.findById(member.plan);
          planDuration = plan?.duration || 30;
        }
        
        member.startDate = new Date();
        member.endDate = new Date(Date.now() + planDuration * 24 * 60 * 60 * 1000);
        await member.save();
      }
    } else {
      payment.status = 'failed';
      payment.verifiedBy = req.user._id;
      payment.verificationDate = new Date();
      
      // Update member status to rejected
      await Member.findByIdAndUpdate(payment.member, { 
        status: 'rejected',
        paymentStatus: 'unpaid'
      });
    }
    
    if (notes) {
      payment.paymentProof.notes = notes;
    }
    
    await payment.save();
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

