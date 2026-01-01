import { User, AttendanceRecord, Assignment, AttendanceSummary, MonthlyAttendance, AttendanceProjection, AttendanceEditLog } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth, differenceInDays, isToday, isBefore } from 'date-fns';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@college.edu',
    rollNumber: 'ADMIN001',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    email: 'rahul@college.edu',
    rollNumber: 'CS2024001',
    role: 'student',
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya@college.edu',
    rollNumber: 'CS2024002',
    role: 'student',
  },
  {
    id: '4',
    name: 'Amit Kumar',
    email: 'amit@college.edu',
    rollNumber: 'CS2024003',
    role: 'student',
  },
];

// Generate mock attendance records (daily, no subjects)
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const students = mockUsers.filter(u => u.role === 'student');
  const today = new Date();
  
  students.forEach(student => {
    // Generate 45 working days of attendance
    let dayCount = 0;
    let daysBack = 0;
    
    while (dayCount < 45) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysBack);
      daysBack++;
      
      // Skip weekends
      if (isWeekend(date)) continue;
      
      // Skip today and future
      if (date >= today) continue;
      
      dayCount++;
      
      // Random attendance with varying rates per student
      let presentChance = 0.88;
      if (student.id === '2') presentChance = 0.76; // Rahul - borderline
      if (student.id === '4') presentChance = 0.68; // Amit - low attendance
      
      records.push({
        id: `${student.id}-${date.toISOString().split('T')[0]}`,
        studentId: student.id,
        date: date.toISOString().split('T')[0],
        status: Math.random() < presentChance ? 'present' : 'absent',
      });
    }
  });
  
  return records;
};

export let mockAttendance: AttendanceRecord[] = generateAttendanceRecords();

// Edit history log
export let attendanceEditLog: AttendanceEditLog[] = [];

// Add or update attendance record
export const updateAttendanceRecord = (studentId: string, date: string, status: 'present' | 'absent') => {
  const existingIndex = mockAttendance.findIndex(
    r => r.studentId === studentId && r.date === date
  );
  
  if (existingIndex >= 0) {
    const oldStatus = mockAttendance[existingIndex].status;
    if (oldStatus !== status) {
      // Log the edit
      attendanceEditLog.push({
        id: `edit-${Date.now()}-${studentId}`,
        studentId,
        date,
        oldStatus,
        newStatus: status,
        editedAt: new Date().toISOString(),
      });
      mockAttendance[existingIndex].status = status;
    }
  } else {
    mockAttendance.push({
      id: `${studentId}-${date}`,
      studentId,
      date,
      status,
    });
  }
};

// Calculate attendance summary for a student
export const calculateAttendanceSummary = (studentId: string): AttendanceSummary => {
  const studentRecords = mockAttendance
    .filter(r => r.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalDays = studentRecords.length;
  const presentDays = studentRecords.filter(r => r.status === 'present').length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  
  // Calculate current streak
  let streak = 0;
  for (const record of studentRecords) {
    if (record.status === 'present') {
      streak++;
    } else {
      break;
    }
  }
  
  return { totalDays, presentDays, percentage, streak };
};

// Calculate monthly attendance breakdown
export const calculateMonthlyAttendance = (studentId: string): MonthlyAttendance[] => {
  const studentRecords = mockAttendance.filter(r => r.studentId === studentId);
  const monthlyData: Map<string, { working: number; present: number }> = new Map();
  
  studentRecords.forEach(record => {
    const date = new Date(record.date);
    const monthKey = format(date, 'MMMM yyyy');
    
    const existing = monthlyData.get(monthKey) || { working: 0, present: 0 };
    existing.working++;
    if (record.status === 'present') existing.present++;
    monthlyData.set(monthKey, existing);
  });
  
  const result: MonthlyAttendance[] = [];
  monthlyData.forEach((data, month) => {
    result.push({
      month,
      workingDays: data.working,
      presentDays: data.present,
      percentage: Math.round((data.present / data.working) * 100),
    });
  });
  
  return result.reverse(); // Most recent first
};

// Calculate attendance projection
export const calculateProjection = (studentId: string, futureDays: number = 5): AttendanceProjection => {
  const summary = calculateAttendanceSummary(studentId);
  const projectedTotal = summary.totalDays + futureDays;
  const projectedPresent = summary.presentDays + futureDays;
  const projectedPercentage = Math.round((projectedPresent / projectedTotal) * 100);
  
  return {
    currentPercentage: summary.percentage,
    daysToAttend: futureDays,
    projectedPercentage,
  };
};

// Mock Assignments (no subject field)
export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Binary Search Tree Implementation',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Implement BST with insert, delete, and search operations.',
  },
  {
    id: '2',
    title: 'ER Diagram for Library System',
    deadline: new Date().toISOString().split('T')[0], // Due today
    description: 'Design complete ER diagram with all entities and relationships.',
  },
  {
    id: '3',
    title: 'Process Scheduling Report',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Compare FCFS, SJF, and Round Robin with examples.',
  },
  {
    id: '4',
    title: 'TCP/IP Model Report',
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Detailed report on TCP/IP layers and protocols.',
  },
  {
    id: '5',
    title: 'Responsive Landing Page',
    deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Create a mobile-first responsive landing page.',
  },
  {
    id: '6',
    title: 'Hash Table Implementation',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Implement hash table with collision handling.',
  },
];

// Get assignment display status based on deadline
export const getAssignmentStatus = (deadline: string): 'upcoming' | 'due-today' | 'missed' => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  if (isToday(deadlineDate)) return 'due-today';
  if (isBefore(deadlineDate, today)) return 'missed';
  return 'upcoming';
};

// Get days until deadline (negative if past)
export const getDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return differenceInDays(deadlineDate, today);
};

// Get upcoming assignments (next 3)
export const getUpcomingAssignments = (): Assignment[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockAssignments
    .filter(a => {
      const deadline = new Date(a.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= today;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);
};

// Get all students for admin
export const getStudents = (): User[] => {
  return mockUsers.filter(u => u.role === 'student');
};

// Export attendance as CSV
export const exportAttendanceCSV = (): string => {
  const students = getStudents();
  const headers = ['Roll Number', 'Name', 'Total Days', 'Present', 'Absent', 'Percentage'];
  
  const rows = students.map(student => {
    const summary = calculateAttendanceSummary(student.id);
    return [
      student.rollNumber,
      student.name,
      summary.totalDays,
      summary.presentDays,
      summary.totalDays - summary.presentDays,
      `${summary.percentage}%`,
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

// Get attendance edit history
export const getEditHistory = (): AttendanceEditLog[] => {
  return attendanceEditLog.sort((a, b) => 
    new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
  );
};
