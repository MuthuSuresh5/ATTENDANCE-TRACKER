export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  role: UserRole;
}

export type AttendanceStatus = 'present' | 'absent';

// Daily attendance - no subject
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string
  status: AttendanceStatus;
}

// For tracking edit history
export interface AttendanceEditLog {
  id: string;
  studentId: string;
  date: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  editedAt: string; // ISO datetime string
}

// Assignment - no subject field
export interface Assignment {
  id: string;
  title: string;
  deadline: string; // ISO date string
  description: string;
}

// Calculated assignment status
export type AssignmentDisplayStatus = 'upcoming' | 'due-today' | 'missed';

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  percentage: number;
  streak: number; // consecutive present days
}

export interface MonthlyAttendance {
  month: string; // e.g., "January 2024"
  workingDays: number;
  presentDays: number;
  percentage: number;
}

export interface AttendanceProjection {
  currentPercentage: number;
  daysToAttend: number;
  projectedPercentage: number;
}

// API response types for your Express backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
