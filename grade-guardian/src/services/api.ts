const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://attendance-backend-kuqk.onrender.com/api' 
  : 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  login = async (rollNumber: string, password: string) => {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ rollNumber, password })
    });
  };

  register = async (userData: any) => {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  };

  changePassword = async (currentPassword: string, newPassword: string) => {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  };

  // User endpoints
  getProfile = async () => {
    return this.request('/users/profile');
  };

  getStudents = async () => {
    return this.request('/users/students');
  };

  createStudent = async (studentData: any) => {
    return this.request('/users/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  };

  updateStudent = async (id: string, studentData: any) => {
    return this.request(`/users/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  };

  deleteStudent = async (id: string) => {
    return this.request(`/users/students/${id}`, {
      method: 'DELETE'
    });
  };

  // Attendance endpoints
  markAttendance = async (studentId: string, date: string, status: 'present' | 'absent') => {
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ studentId, date, status })
    });
  };

  getAttendance = async (params?: { studentId?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/attendance${query ? `?${query}` : ''}`);
  };

  getAttendanceSummary = async (studentId?: string) => {
    return this.request(`/attendance/summary${studentId ? `/${studentId}` : ''}`);
  };

  getMonthlyAttendance = async (studentId?: string) => {
    return this.request(`/attendance/monthly${studentId ? `/${studentId}` : ''}`);
  };

  getEditHistory = async () => {
    return this.request('/attendance/history');
  };

  exportAttendance = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/attendance/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  };

  // Assignment endpoints
  getAssignments = async () => {
    return this.request('/assignments');
  };

  createAssignment = async (assignment: any) => {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  };

  updateAssignment = async (id: string, assignment: any) => {
    return this.request(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignment)
    });
  };

  deleteAssignment = async (id: string) => {
    return this.request(`/assignments/${id}`, {
      method: 'DELETE'
    });
  };

  markAssignmentComplete = async (assignmentId: string) => {
    return this.request(`/assignments/${assignmentId}/complete`, {
      method: 'POST'
    });
  };
}

export default new ApiService();