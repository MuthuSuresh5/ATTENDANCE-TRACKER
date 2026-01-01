import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useStudents, useMarkAttendance, useEditHistory } from '@/hooks/useApi';
import apiService from '@/services/api';
import { format } from 'date-fns';
import { CalendarIcon, Check, X, Save, Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentAttendance {
  studentId: string;
  status: 'present' | 'absent' | null;
}

const AdminAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const { data: editHistoryData, isLoading: historyLoading } = useEditHistory();
  const markAttendanceMutation = useMarkAttendance();

  const students = studentsData?.data || [];
  const editHistory = editHistoryData?.data || [];

  // Initialize attendance when date changes
  const initializeForDate = async (date: Date) => {
    setSelectedDate(date);
    setIsInitialized(false);
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    try {
      // Get attendance for all students on the selected date
      const response = await apiService.getAttendance({
        startDate: dateStr,
        endDate: dateStr
      });
      
      setAttendanceData(
        students.map((s: any) => {
          const existing = response.data.find(
            (r: any) => r.studentId._id.toString() === s._id.toString()
          );
          return { 
            studentId: s._id, 
            status: existing?.status || null 
          };
        })
      );
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceData(
        students.map((s: any) => ({ studentId: s._id, status: null }))
      );
    }
    
    setIsInitialized(true);
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const markAllPresent = () => {
    setAttendanceData(prev =>
      prev.map(item => ({ ...item, status: 'present' }))
    );
  };

  const markAllAbsent = () => {
    setAttendanceData(prev =>
      prev.map(item => ({ ...item, status: 'absent' }))
    );
  };

  const handleSubmit = async () => {
    const unmarked = attendanceData.filter(a => a.status === null);
    
    if (unmarked.length > 0) {
      toast({
        title: 'Incomplete Attendance',
        description: `Please mark attendance for all ${unmarked.length} remaining student(s)`,
        variant: 'destructive',
      });
      return;
    }

    // Format date as YYYY-MM-DD in local timezone to avoid UTC conversion
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    try {
      // Mark attendance for each student
      for (const record of attendanceData) {
        if (record.status) {
          await markAttendanceMutation.mutateAsync({
            studentId: record.studentId,
            date: dateStr,
            status: record.status
          });
        }
      }
      
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${format(selectedDate, 'MMM d, yyyy')} has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save attendance',
        variant: 'destructive',
      });
    }
  };

  const presentCount = attendanceData.filter(a => a.status === 'present').length;
  const absentCount = attendanceData.filter(a => a.status === 'absent').length;

  if (studentsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">Record daily attendance for your class</p>
          </div>
        </div>

        <Tabs defaultValue="mark" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="history">Edit History</TabsTrigger>
          </TabsList>

          <TabsContent value="mark" className="space-y-4">
            {/* Date Selection */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full sm:w-auto justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                        onClick={() => !isInitialized && initializeForDate(selectedDate)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date && students.length > 0) {
                            initializeForDate(date);
                          } else if (date) {
                            setSelectedDate(date);
                            setIsInitialized(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {!isInitialized ? (
                  <Button className="mt-4" onClick={() => initializeForDate(selectedDate)}>
                    Load Students for {format(selectedDate, 'MMM d, yyyy')}
                  </Button>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Showing attendance for {format(selectedDate, 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Attendance List */}
            {isInitialized && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Student List</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Present: {presentCount} | Absent: {absentCount} | Unmarked: {attendanceData.length - presentCount - absentCount}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={markAllPresent}>
                        <Check className="h-4 w-4 mr-1" />
                        All Present
                      </Button>
                      <Button variant="outline" size="sm" onClick={markAllAbsent}>
                        <X className="h-4 w-4 mr-1" />
                        All Absent
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {students.map((student: any) => {
                    const attendance = attendanceData.find(a => a.studentId === student._id);
                    const status = attendance?.status;

                    return (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={status === 'present' ? 'default' : 'outline'}
                            className={status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-green-50'}
                            onClick={() => markAttendance(student._id, 'present')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={status === 'absent' ? 'default' : 'outline'}
                            className={status === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'hover:bg-red-50'}
                            onClick={() => markAttendance(student._id, 'absent')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4">
                    <Button className="w-full" onClick={handleSubmit}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Edit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editHistory.length > 0 ? (
                  <div className="space-y-2">
                    {editHistory.slice(0, 10).map((log: any) => {
                      const student = students.find((s: any) => s._id === log.studentId._id);
                      return (
                        <div
                          key={log._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <div>
                            <p className="font-medium">{log.studentId.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p>
                              <span className={log.oldStatus === 'present' ? 'attendance-good-text' : 'attendance-danger-text'}>
                                {log.oldStatus}
                              </span>
                              {' → '}
                              <span className={log.newStatus === 'present' ? 'attendance-good-text' : 'attendance-danger-text'}>
                                {log.newStatus}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No edit history yet</p>
                    <p className="text-sm">Changes will appear here when you modify existing records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminAttendance;
