import { validationResult } from 'express-validator';
import User from '../models/User.js';

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ rollNumber: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, rollNumber, password } = req.body;
    
    const existingUser = await User.findOne({ rollNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }

    // Generate email from roll number
    const email = `${rollNumber.toLowerCase()}@college.edu`;

    const student = new User({ 
      name, 
      email, 
      rollNumber, 
      password, 
      role: 'student' 
    });
    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    res.status(201).json({ success: true, data: studentData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { name, rollNumber, password } = req.body;
    
    const existingUser = await User.findOne({ 
      rollNumber,
      _id: { $ne: id }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }

    const updateData = { name, rollNumber };
    if (password) {
      updateData.password = password;
    }
    // Auto-generate email from roll number
    updateData.email = `${rollNumber.toLowerCase()}@college.edu`;

    const student = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};