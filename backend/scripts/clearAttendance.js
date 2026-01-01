import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from '../models/Attendance.js';

dotenv.config();

const clearAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all attendance records
    const result = await Attendance.deleteMany({});
    console.log(`Deleted ${result.deletedCount} attendance records`);

    console.log('Attendance data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Clear error:', error);
    process.exit(1);
  }
};

clearAttendance();