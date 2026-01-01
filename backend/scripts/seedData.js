import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { startOfDay, subDays, isWeekend } from 'date-fns';

import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Assignment.deleteMany({});

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: await bcrypt.hash('admin123', 12),
        rollNumber: 'ADMIN001',
        role: 'admin'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        password: await bcrypt.hash('student123', 12),
        rollNumber: 'CS2024001',
        role: 'student'
      },
      {
        name: 'Priya Patel',
        email: 'priya@college.edu',
        password: await bcrypt.hash('student123', 12),
        rollNumber: 'CS2024002',
        role: 'student'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@college.edu',
        password: await bcrypt.hash('student123', 12),
        rollNumber: 'CS2024003',
        role: 'student'
      }
    ];

    const createdUsers = await User.insertMany(users);
    const admin = createdUsers.find(u => u.role === 'admin');
    const students = createdUsers.filter(u => u.role === 'student');

    // Generate attendance records (45 working days)
    const attendanceRecords = [];
    const today = new Date();
    
    students.forEach(student => {
      let dayCount = 0;
      let daysBack = 1;
      
      while (dayCount < 45) {
        const date = startOfDay(subDays(today, daysBack));
        daysBack++;
        
        if (isWeekend(date)) continue;
        dayCount++;
        
        let presentChance = 0.88;
        if (student.rollNumber === 'CS2024001') presentChance = 0.76;
        if (student.rollNumber === 'CS2024003') presentChance = 0.68;
        
        attendanceRecords.push({
          studentId: student._id,
          date,
          status: Math.random() < presentChance ? 'present' : 'absent',
          markedBy: admin._id
        });
      }
    });

    await Attendance.insertMany(attendanceRecords);

    // Create assignments
    const assignments = [
      {
        title: 'Binary Search Tree Implementation',
        description: 'Implement BST with insert, delete, and search operations.',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'ER Diagram for Library System',
        description: 'Design complete ER diagram with all entities and relationships.',
        deadline: new Date(),
        createdBy: admin._id
      },
      {
        title: 'Process Scheduling Report',
        description: 'Compare FCFS, SJF, and Round Robin with examples.',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      }
    ];

    await Assignment.insertMany(assignments);

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Student: rahul@college.edu / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();