import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './utils/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import gymRoutes from './routes/gym.js';
import memberRoutes from './routes/member.js';
import userRoutes from './routes/user.js';
import paymentRoutes from './routes/payment.js';
import supportRoutes from './routes/support.js';
import fileRoutes from './routes/fileRoutes.js';
import subscriptionRoutes from './routes/subscription.js';
import staffRoutes from './routes/staff.js';
import invitationRoutes from './routes/invitation.js';
 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/invitations', invitationRoutes);

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});