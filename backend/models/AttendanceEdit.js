import mongoose from 'mongoose';

const attendanceEditSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  oldStatus: { type: String, enum: ['present', 'absent'], required: true },
  newStatus: { type: String, enum: ['present', 'absent'], required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('AttendanceEdit', attendanceEditSchema);