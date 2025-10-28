import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, phone, dateOfBirth, role = 'member' } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const userData = { name, email, password, role };
    if (username && username.trim()) {
      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
      }
      if (username.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters' });
      }
      userData.username = username.trim();
    }
    if (phone) userData.phone = phone;
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({ user: { id: user._id, name, email, username, role } });
  } catch (error) {
    console.error('Registration error:', error);
    let message = 'Registration failed';
    let statusCode = 500;
    
    if (error.code === 11000) {
      statusCode = 400;
      if (error.keyPattern?.email) {
        message = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.keyPattern?.username) {
        message = 'This username is already taken. Please choose a different username.';
      } else if (error.keyPattern?.business_email) {
        message = 'This business email is already registered.';
      } else {
        message = 'This information is already registered. Please check your details.';
      }
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors)[0]?.message || 'Please check your input data';
    }
    
    res.status(statusCode).json({ message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    // Try to find user by email or username
    const user = await User.findOne({ 
      $or: [
        { email: email },
        { username: email }
      ]
    });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account banned' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;