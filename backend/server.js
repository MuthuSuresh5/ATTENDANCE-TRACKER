import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import assignmentRoutes from './routes/assignments.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://attendance-tracker-sigma-ruddy.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Grade Guardian API is running' });
});

// Test user creation endpoint (temporary)
app.post('/api/create-test-user', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;
    
    // Delete existing test user
    await User.deleteOne({ rollNumber: 'TEST001' });
    
    // Create new test user
    const testUser = new User({
      name: 'Test Admin',
      email: 'test@college.edu',
      password: 'test123',
      rollNumber: 'TEST001',
      role: 'admin'
    });
    
    await testUser.save();
    res.json({ success: true, message: 'Test user created with password: test123' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});