import mongoose from 'mongoose';

const assignmentCompletionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

assignmentCompletionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

export default mongoose.model('AssignmentCompletion', assignmentCompletionSchema);