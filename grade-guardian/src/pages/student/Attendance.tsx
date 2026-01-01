import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceCard from '@/components/AttendanceCard';
import { useAttendanceSummary, useMonthlyAttendance, useAttendance } from '@/hooks/useApi';
import { Calendar, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const StudentAttendance: React.FC = () => {
  const { data: summaryData, isLoading: summaryLoading } = useAttendanceSummary();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyAttendance();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();

  if (summaryLoading || monthlyLoading || attendanceLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = summaryData?.data || { totalDays: 0, presentDays: 0, percentage: 0, streak: 0 };
  const monthlyAttendance = monthlyData?.data || [];
  const attendanceRecords = attendanceData?.data || [];
  
  // Get absent dates - deduplicate by date and keep most recent record for each date
  const absentDatesMap = new Map();
  attendanceRecords
    .filter((record: any) => record.status === 'absent')
    .forEach((record: any) => {
      const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
      if (!absentDatesMap.has(dateKey) || new Date(record.createdAt || record.date) > new Date(absentDatesMap.get(dateKey).createdAt || absentDatesMap.get(dateKey).date)) {
        absentDatesMap.set(dateKey, record);
      }
    });
  
  const absentDates = Array.from(absentDatesMap.values())
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Show last 10 absent dates

  return (
    <Layout>
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">My Attendance</h1>
            <p className="text-sm text-muted-foreground">Track your attendance record and performance</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="w-full overflow-x-auto mb-6">
              <TabsList className="grid w-full grid-cols-4 min-w-[320px]">
                <TabsTrigger value="overview" className="text-xs px-1 py-2">Overview</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-1 py-2">Monthly</TabsTrigger>
                <TabsTrigger value="absent" className="text-xs px-1 py-2">Absent</TabsTrigger>
                <TabsTrigger value="records" className="text-xs px-1 py-2">Records</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="w-full">
              <div className="space-y-6">
                <div className="w-full">
                  <AttendanceCard 
                    title="Overall Performance"
                    percentage={summary.percentage}
                    present={summary.presentDays}
                    total={summary.totalDays}
                    streak={summary.streak}
                  />
                </div>
                
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Streak</span>
                        <span className="text-lg font-bold">{summary.streak} days</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summary.streak >= 5 ? 'Excellent consistency!' : 'Keep building your streak'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Days Attended</span>
                        <span className="text-lg font-bold">{summary.presentDays}/{summary.totalDays}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total working days recorded
                      </p>
                    </div>
                    
                    {summary.percentage < 75 && (
                      <div className="p-4 rounded-lg bg-attendance-danger/10 border border-attendance-danger/20">
                        <p className="text-sm font-medium text-attendance-danger mb-1">
                          Attendance Warning
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your attendance is below 75%. Please attend regularly to meet requirements.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyAttendance.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {monthlyAttendance.map((month: any) => (
                        <div key={month.month} className="p-4 rounded-lg border bg-card">
                          <h3 className="font-medium text-sm mb-3">{month.month}</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Attendance</span>
                              <span className="font-medium">{month.percentage}%</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Present Days</span>
                              <span>{month.presentDays}/{month.workingDays}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-primary" 
                                style={{ width: `${month.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      <p>No monthly data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="absent" className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Absent Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {absentDates.length > 0 ? (
                    <div className="space-y-3">
                      {absentDates.map((record: any) => (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                          <span className="text-sm font-medium text-red-800 dark:text-red-200 flex-1 mr-3">
                            {format(new Date(record.date), 'EEEE, MMM d, yyyy')}
                          </span>
                          <span className="text-xs bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded-full flex-shrink-0">
                            Absent
                          </span>
                        </div>
                      ))}
                      {Array.from(new Set(attendanceRecords.filter((r: any) => r.status === 'absent').map((r: any) => format(new Date(r.date), 'yyyy-MM-dd')))).length > 10 && (
                        <p className="text-sm text-muted-foreground text-center pt-4">
                          Showing recent 10 absent dates
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      <p>No absent dates found</p>
                      <p className="text-sm mt-2">Great job maintaining perfect attendance!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceRecords.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {(() => {
                        // Deduplicate records by date, keeping the most recent record for each date
                        const recordsMap = new Map();
                        attendanceRecords.forEach((record: any) => {
                          const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
                          if (!recordsMap.has(dateKey) || new Date(record.createdAt || record.date) > new Date(recordsMap.get(dateKey).createdAt || recordsMap.get(dateKey).date)) {
                            recordsMap.set(dateKey, record);
                          }
                        });
                        
                        return Array.from(recordsMap.values())
                          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((record: any) => (
                            <div 
                              key={`${record._id}-${format(new Date(record.date), 'yyyy-MM-dd')}`} 
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                            >
                              <span className="text-sm font-medium flex-1 mr-3">
                                {format(new Date(record.date), 'MMM d, yyyy')}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                                record.status === 'present' 
                                  ? 'bg-attendance-good text-white' 
                                  : 'bg-attendance-danger text-white'
                              }`}>
                                {record.status === 'present' ? 'Present' : 'Absent'}
                              </span>
                            </div>
                          ));
                      })()
                      }
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      <p>No attendance records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StudentAttendance;