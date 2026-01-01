# Grade Guardian - Complete MERN Stack Setup

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grade-guardian
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. **Start MongoDB:**
- For local MongoDB: `mongod`
- For MongoDB Atlas: Use your connection string in MONGODB_URI

5. **Seed the database:**
```bash
npm run seed
```

6. **Start backend server:**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd grade-guardian
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start frontend development server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:8080`

## Default Login Credentials

### Admin Account
- **Email:** admin@college.edu
- **Password:** admin123

### Student Accounts
- **Email:** rahul@college.edu | **Password:** student123
- **Email:** priya@college.edu | **Password:** student123
- **Email:** amit@college.edu | **Password:** student123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Attendance (Protected)
- `POST /api/attendance/mark` - Mark attendance (Admin only)
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/summary/:studentId?` - Get attendance summary
- `GET /api/attendance/monthly/:studentId?` - Get monthly breakdown
- `GET /api/attendance/history` - Get edit history (Admin only)
- `GET /api/attendance/export` - Export CSV (Admin only)

### Assignments (Protected)
- `POST /api/assignments` - Create assignment (Admin only)
- `GET /api/assignments` - Get all assignments
- `PUT /api/assignments/:id` - Update assignment (Admin only)
- `DELETE /api/assignments/:id` - Delete assignment (Admin only)

### Users (Protected)
- `GET /api/users/students` - Get all students (Admin only)
- `GET /api/users/profile` - Get user profile

## Features Implemented

### Frontend Integration
✅ Real API authentication with JWT tokens
✅ React Query for data fetching and caching
✅ Loading states and error handling
✅ Role-based routing and access control
✅ Real-time data updates after mutations

### Backend Features
✅ MongoDB with Mongoose ODM
✅ JWT authentication and authorization
✅ Password hashing with bcrypt
✅ Input validation with express-validator
✅ CORS enabled for frontend communication
✅ Comprehensive error handling
✅ Database seeding with realistic data

### Admin Features
✅ Mark daily attendance for all students
✅ Create, edit, and delete assignments
✅ View attendance statistics and reports
✅ Export attendance data as CSV
✅ Track attendance edit history

### Student Features
✅ View personal attendance dashboard
✅ Track attendance percentage and streaks
✅ View monthly attendance breakdown
✅ See upcoming assignments and deadlines
✅ Risk warnings for low attendance

## Development Notes

- Backend uses ES6 modules (type: "module" in package.json)
- Frontend uses Vite for fast development and building
- All API calls are properly typed with TypeScript
- Error handling includes user-friendly toast notifications
- Data is automatically refreshed after mutations
- Responsive design works on mobile and desktop

## Production Deployment

1. **Backend:**
   - Set NODE_ENV=production
   - Use a secure JWT_SECRET
   - Deploy to services like Heroku, Railway, or DigitalOcean
   - Use MongoDB Atlas for database

2. **Frontend:**
   - Update API_BASE_URL in api.ts to production backend URL
   - Build with `npm run build`
   - Deploy to Vercel, Netlify, or similar services

The application is now fully connected with a complete MERN stack implementation!