import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import { useStudents, useAttendance, useAssignments } from '@/hooks/useApi';
import { Users, Calendar, ClipboardList, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStatistics: React.FC = () => {
  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments();

  if (studentsLoading || attendanceLoading || assignmentsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const students = studentsData?.data || [];
  const attendanceRecords = attendanceData?.data || [];
  const assignments = assignmentsData?.data || [];

  // Calculate statistics
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const totalAttendanceRecords = attendanceRecords.length;

  // Calculate class attendance average
  const studentAttendanceMap = new Map();
  attendanceRecords.forEach((record: any) => {
    const studentId = record.studentId._id || record.studentId;
    if (!studentAttendanceMap.has(studentId)) {
      studentAttendanceMap.set(studentId, { total: 0, present: 0 });
    }
    const stats = studentAttendanceMap.get(studentId);
    stats.total++;
    if (record.status === 'present') stats.present++;
  });

  const attendancePercentages = Array.from(studentAttendanceMap.values()).map(
    (stats: any) => stats.total > 0 ? (stats.present / stats.total) * 100 : 0
  );
  
  const classAverage = attendancePercentages.length > 0 
    ? Math.round(attendancePercentages.reduce((sum, pct) => sum + pct, 0) / attendancePercentages.length)
    : 0;

  const studentsAtRisk = attendancePercentages.filter(pct => pct < 75).length;
  const studentsExcellent = attendancePercentages.filter(pct => pct >= 90).length;

  // Assignment statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAssignments = assignments.filter((a: any) => {
    const deadline = new Date(a.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline >= today;
  }).length;

  const overdueAssignments = assignments.filter((a: any) => {
    const deadline = new Date(a.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Class Statistics</h1>
            <p className="text-muted-foreground">Overview of class performance and metrics</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/students">
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students"
            value={totalStudents.toString()}
            subtitle="Enrolled students"
            icon={Users}
          />
          <StatsCard
            title="Class Average"
            value={`${classAverage}%`}
            subtitle="Attendance rate"
            icon={TrendingUp}
            variant={classAverage >= 80 ? 'success' : classAverage >= 75 ? 'warning' : 'danger'}
          />
          <StatsCard
            title="At Risk Students"
            value={studentsAtRisk.toString()}
            subtitle="Below 75% attendance"
            icon={AlertTriangle}
            variant={studentsAtRisk > 0 ? 'danger' : 'success'}
          />
          <StatsCard
            title="Excellent Students"
            value={studentsExcellent.toString()}
            subtitle="Above 90% attendance"
            icon={CheckCircle}
            variant="success"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-3">
                  {students.slice(0, 5).map((student: any) => {
                    const studentStats = studentAttendanceMap.get(student._id) || { total: 0, present: 0 };
                    const percentage = studentStats.total > 0 ? Math.round((studentStats.present / studentStats.total) * 100) : 0;
                    
                    return (
                      <div key={student._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            percentage >= 90 ? 'text-green-600' :
                            percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {percentage}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {studentStats.present}/{studentStats.total}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {students.length > 5 && (
                    <div className="text-center pt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/students">View All Students</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No students enrolled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{totalAssignments}</p>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-600">{upcomingAssignments}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
              
              {overdueAssignments > 0 && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">{overdueAssignments} Overdue Assignment{overdueAssignments !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">Consider reviewing or removing past assignments</p>
                </div>
              )}

              <div className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/assignments">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 text-center">
                <p className="text-2xl font-bold text-green-600">{studentsExcellent}</p>
                <p className="text-sm text-muted-foreground">Excellent (≥90%)</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {attendancePercentages.filter(pct => pct >= 75 && pct < 90).length}
                </p>
                <p className="text-sm text-muted-foreground">Good (75-89%)</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 text-center">
                <p className="text-2xl font-bold text-red-600">{studentsAtRisk}</p>
                <p className="text-sm text-muted-foreground">At Risk (&lt;75%)</p>
              </div>
            </div>
            
            {studentsAtRisk > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Action Required</span>
                </div>
                <p className="text-sm text-red-600">
                  {studentsAtRisk} student{studentsAtRisk !== 1 ? 's' : ''} {studentsAtRisk === 1 ? 'has' : 'have'} attendance below 75%. 
                  Consider reaching out to improve their attendance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminStatistics;