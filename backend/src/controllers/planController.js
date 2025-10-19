import Plan from '../models/Plan.js';
import Gym from '../models/Gym.js';

// Get all plans for gym owner
export const getGymPlans = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const plans = await Plan.find({ gym: gym._id }).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new plan
export const createPlan = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const plan = new Plan({
      gym: gym._id,
      name,
      description,
      price,
      duration
    });

    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, isActive } = req.body;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const plan = await Plan.findOneAndUpdate(
      { _id: id, gym: gym._id },
      { name, description, price, duration, isActive },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const gym = await Gym.findOne({ owner_user_id: req.user._id });
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const plan = await Plan.findOneAndDelete({ _id: id, gym: gym._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};