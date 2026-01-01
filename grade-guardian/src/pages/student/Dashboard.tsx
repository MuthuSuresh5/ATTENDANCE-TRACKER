import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import AssignmentCard from '@/components/AssignmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendanceSummary, useMonthlyAttendance, useAssignments } from '@/hooks/useApi';
import { getAttendanceTextColor, getAttendanceLabel, getAttendanceColor } from '@/components/AttendanceCard';
import { Calendar, AlertTriangle, TrendingUp, Flame, Target } from 'lucide-react';
import { isToday, isBefore } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: attendanceSummary, isLoading: summaryLoading } = useAttendanceSummary();
  const { data: monthlyAttendance, isLoading: monthlyLoading } = useMonthlyAttendance();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments();
  
  if (summaryLoading || monthlyLoading || assignmentsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = attendanceSummary?.data || { totalDays: 0, presentDays: 0, percentage: 0, streak: 0 };
  const monthly = monthlyAttendance?.data || [];
  const assignments = assignmentsData?.data || [];
  
  // Filter upcoming assignments
  const upcomingAssignments = assignments
    .filter((a: any) => {
      const deadline = new Date(a.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= today;
    })
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);
  
  const isAtRisk = summary.percentage < 75;
  const projection = {
    currentPercentage: summary.percentage,
    daysToAttend: 5,
    projectedPercentage: Math.round(((summary.presentDays + 5) / (summary.totalDays + 5)) * 100)
  };

  const getOverallVariant = () => {
    if (summary.percentage >= 80) return 'success';
    if (summary.percentage >= 75) return 'warning';
    return 'danger';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's your attendance overview</p>
        </div>

        {/* Risk Warning */}
        {isAtRisk && (
          <Card className="border-attendance-danger bg-attendance-danger/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-attendance-danger/10">
                  <AlertTriangle className="h-5 w-5 text-attendance-danger" />
                </div>
                <div>
                  <h3 className="font-semibold text-attendance-danger">Attendance Warning - At Risk</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your attendance is below 75%. You may face issues with exam eligibility.
                    Attend regularly to improve your standing.
                  </p>
                  {projection.projectedPercentage >= 75 && (
                    <p className="text-sm font-medium mt-2 attendance-good-text">
                      Good news: If you attend the next {projection.daysToAttend} days, your attendance will reach {projection.projectedPercentage}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Overall Attendance"
            value={`${summary.percentage}%`}
            subtitle={getAttendanceLabel(summary.percentage)}
            icon={TrendingUp}
            variant={getOverallVariant()}
          />
          <StatsCard
            title="Days Present"
            value={`${summary.presentDays}/${summary.totalDays}`}
            subtitle="Working days"
            icon={Calendar}
          />
          <StatsCard
            title="Current Streak"
            value={`${summary.streak} days`}
            subtitle={summary.streak > 5 ? 'Keep it up!' : 'Build momentum'}
            icon={Flame}
            variant={summary.streak >= 5 ? 'success' : 'default'}
          />
          <StatsCard
            title="Upcoming Deadlines"
            value={upcomingAssignments.length}
            subtitle="Assignments due"
            icon={Calendar}
            variant={upcomingAssignments.length > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Large percentage display */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getAttendanceColor(summary.percentage)}`}>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">{summary.percentage}%</span>
                    <p className="text-xs text-white/80 mt-1">{getAttendanceLabel(summary.percentage)}</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{summary.totalDays}</p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
                <div className="p-3 rounded-lg bg-attendance-good/10">
                  <p className="text-2xl font-bold attendance-good-text">{summary.presentDays}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="p-3 rounded-lg bg-attendance-danger/10">
                  <p className="text-2xl font-bold attendance-danger-text">{summary.totalDays - summary.presentDays}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>

              {/* Projection */}
              {!isAtRisk && projection.projectedPercentage > attendanceSummary.percentage && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">Projection:</span> If you attend the next {projection.daysToAttend} days, 
                    your attendance will be <span className={`font-bold ${getAttendanceTextColor(projection.projectedPercentage)}`}>
                      {projection.projectedPercentage}%
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} showDescription={false} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No upcoming assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        {monthly.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthly.map((month: any) => (
                  <div key={month.month} className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{month.month}</p>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className={`text-2xl font-bold ${getAttendanceTextColor(month.percentage)}`}>
                          {month.percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {month.presentDays} / {month.workingDays} days
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getAttendanceColor(month.percentage)} text-white`}>
                        {getAttendanceLabel(month.percentage)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
