import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Attendance hooks
export const useAttendanceSummary = (studentId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['attendanceSummary', studentId || user?.id],
    queryFn: () => apiService.getAttendanceSummary(studentId),
    enabled: !!(studentId || user?.id)
  });
};

export const useMonthlyAttendance = (studentId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['monthlyAttendance', studentId || user?.id],
    queryFn: () => apiService.getMonthlyAttendance(studentId),
    enabled: !!(studentId || user?.id)
  });
};

export const useAttendance = (params?: { studentId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => apiService.getAttendance(params)
  });
};

export const useEditHistory = () => {
  return useQuery({
    queryKey: ['editHistory'],
    queryFn: () => apiService.getEditHistory()
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, date, status }: { studentId: string; date: string; status: 'present' | 'absent' }) =>
      apiService.markAttendance(studentId, date, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['editHistory'] });
    }
  });
};

// Assignment hooks
export const useAssignments = () => {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => apiService.getAssignments()
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      apiService.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};

// User hooks
export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => apiService.getStudents()
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      apiService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useMarkAssignmentComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.markAssignmentComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};