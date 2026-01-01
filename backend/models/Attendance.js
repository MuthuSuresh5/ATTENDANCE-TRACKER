import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);