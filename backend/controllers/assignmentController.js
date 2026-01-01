import { validationResult } from 'express-validator';
import Assignment from '../models/Assignment.js';
import AssignmentCompletion from '../models/AssignmentCompletion.js';

export const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, deadline } = req.body;
    const assignment = new Assignment({
      title,
      description,
      deadline: new Date(deadline),
      createdBy: req.user._id
    });

    await assignment.save();
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .sort({ deadline: 1 });

    // If student, include completion status
    if (req.user.role === 'student') {
      const completions = await AssignmentCompletion.find({ studentId: req.user._id });
      const completionMap = new Map(completions.map(c => [c.assignmentId.toString(), c]));
      
      const assignmentsWithStatus = assignments.map(assignment => ({
        ...assignment.toObject(),
        isCompleted: completionMap.has(assignment._id.toString()),
        completedAt: completionMap.get(assignment._id.toString())?.completedAt
      }));
      
      return res.json({ success: true, data: assignmentsWithStatus });
    }

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { title, description, deadline } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { title, description, deadline: new Date(deadline) },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAssignmentComplete = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const existingCompletion = await AssignmentCompletion.findOne({
      studentId: req.user._id,
      assignmentId
    });
    
    if (existingCompletion) {
      return res.status(400).json({ error: 'Assignment already marked as completed' });
    }
    
    await new AssignmentCompletion({
      studentId: req.user._id,
      assignmentId
    }).save();
    
    res.json({ success: true, message: 'Assignment marked as completed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};