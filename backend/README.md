# Grade Guardian Backend

MERN stack backend for the Grade Guardian attendance management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grade-guardian
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

3. Start MongoDB service

4. Seed database:
```bash
npm run seed
```

5. Start server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Attendance
- `POST /api/attendance/mark` - Mark attendance (Admin only)
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/summary/:studentId?` - Get attendance summary
- `GET /api/attendance/monthly/:studentId?` - Get monthly breakdown
- `GET /api/attendance/history` - Get edit history (Admin only)
- `GET /api/attendance/export` - Export CSV (Admin only)

### Assignments
- `POST /api/assignments` - Create assignment (Admin only)
- `GET /api/assignments` - Get all assignments
- `PUT /api/assignments/:id` - Update assignment (Admin only)
- `DELETE /api/assignments/:id` - Delete assignment (Admin only)

### Users
- `GET /api/users/students` - Get all students (Admin only)
- `GET /api/users/profile` - Get user profile

## Default Credentials
- Admin: admin@college.edu / admin123
- Student: rahul@college.edu / student123