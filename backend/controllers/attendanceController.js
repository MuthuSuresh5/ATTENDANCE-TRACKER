import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { startOfDay, endOfDay, format, startOfMonth, endOfMonth, isWeekend } from 'date-fns';
import Attendance from '../models/Attendance.js';
import AttendanceEdit from '../models/AttendanceEdit.js';
import User from '../models/User.js';

export const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { studentId, date, status } = req.body;
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = date.split('-');
    const attendanceDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    console.log('Marking attendance:', { studentId, date, status, attendanceDate });

    // Use findOneAndUpdate with upsert to prevent duplicates
    const result = await Attendance.findOneAndUpdate(
      { 
        studentId, 
        date: {
          $gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
          $lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
        }
      },
      {
        studentId,
        date: attendanceDate,
        status,
        markedBy: req.user._id,
        $setOnInsert: { createdAt: new Date() }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    // Log edit if this was an update (not insert)
    if (result && !result.isNew) {
      const oldRecord = await Attendance.findById(result._id);
      if (oldRecord && oldRecord.status !== status) {
        await new AttendanceEdit({
          studentId,
          date: attendanceDate,
          oldStatus: oldRecord.status,
          newStatus: status,
          editedBy: req.user._id
        }).save();
      }
    }

    console.log('Attendance record saved:', result);
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const query = {};

    if (studentId) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }
    if (startDate && endDate) {
      const start = startOfDay(new Date(startDate));
      const end = endOfDay(new Date(endDate));
      query.date = {
        $gte: start,
        $lte: end
      };
    }

    console.log('Attendance query:', query);

    // Get all records first
    const allRecords = await Attendance.find(query)
      .populate('studentId', 'name rollNumber')
      .sort({ date: -1 });

    console.log('Found records before deduplication:', allRecords.length);

    // Deduplicate by date, keeping the LATEST record for each date
    const dateMap = new Map();
    
    for (const record of allRecords) {
      const dateKey = record.date.toISOString().split('T')[0];
      const studentKey = record.studentId._id.toString();
      const compositeKey = `${studentKey}-${dateKey}`;
      
      const existingRecord = dateMap.get(compositeKey);
      
      if (!existingRecord) {
        dateMap.set(compositeKey, record);
      } else {
        // Compare timestamps to keep the latest record
        const existingTime = new Date(existingRecord.updatedAt || existingRecord.createdAt).getTime();
        const currentTime = new Date(record.updatedAt || record.createdAt).getTime();
        
        if (currentTime > existingTime) {
          dateMap.set(compositeKey, record);
        }
      }
    }

    // Convert map back to array and sort by date (newest first)
    const uniqueRecords = Array.from(dateMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('Unique records after deduplication:', uniqueRecords.length);
    res.json({ success: true, data: uniqueRecords });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    console.log('Getting attendance summary for student:', studentId);
    
    const records = await Attendance.find({ studentId }).sort({ date: -1 });
    console.log('Found records:', records.length);
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate streak
    let streak = 0;
    for (const record of records) {
      if (record.status === 'present') {
        streak++;
      } else {
        break;
      }
    }

    console.log('Summary:', { totalDays, presentDays, percentage, streak });
    res.json({
      success: true,
      data: { totalDays, presentDays, percentage, streak }
    });
  } catch (error) {
    console.error('Attendance summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMonthlyAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    
    const records = await Attendance.find({ studentId });
    const monthlyData = {};

    records.forEach(record => {
      const monthKey = format(record.date, 'MMMM yyyy');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { working: 0, present: 0 };
      }
      monthlyData[monthKey].working++;
      if (record.status === 'present') monthlyData[monthKey].present++;
    });

    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      workingDays: data.working,
      presentDays: data.present,
      percentage: Math.round((data.present / data.working) * 100)
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEditHistory = async (req, res) => {
  try {
    const history = await AttendanceEdit.find()
      .populate('studentId', 'name rollNumber')
      .populate('editedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const attendanceRecords = await Attendance.find().populate('studentId', 'name rollNumber');
    
    // Get all unique dates and sort them - use original date strings to avoid timezone issues
    const allDates = [...new Set(attendanceRecords.map(r => {
      // Get the date in the local timezone where it was saved
      const date = new Date(r.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Create headers: Roll Number, Name, then each date, then summary columns
    const headers = ['Roll Number', 'Name', ...allDates.map(dateStr => {
      // Parse date components directly to avoid any timezone conversion
      const [year, month, day] = dateStr.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return format(dateObj, 'MMM dd');
    }), 'Total Days', 'Present', 'Absent', 'Percentage'];
    
    const rows = students.map(student => {
      const studentRecords = attendanceRecords.filter(r => r.studentId._id.toString() === student._id.toString());
      const attendanceMap = new Map();
      
      // Map attendance by date using the same date extraction method
      studentRecords.forEach(record => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        attendanceMap.set(dateStr, record.status === 'present' ? 'P' : 'A');
      });
      
      // Build row data
      const row = [student.rollNumber, student.name];
      
      // Add attendance for each date
      allDates.forEach(date => {
        row.push(attendanceMap.get(date) || '-');
      });
      
      // Add summary columns
      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(r => r.status === 'present').length;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      row.push(totalDays, presentDays, totalDays - presentDays, `${percentage}%`);
      
      return row.join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_detailed_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};