# Healthcare Management System

A comprehensive healthcare management system with frontend and backend separation, built with React and Node.js. The application provides a complete solution for managing healthcare appointments, patient-doctor communication, and medical data.

## 🚀 Features

### Backend Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Patient, Doctor, and Admin user roles
- **Appointment System**: Complete appointment booking and management
- **Medicine Tracking**: Supply chain tracking with blockchain integration
- **Notification System**: Real-time notifications for all users
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: WebSocket support for live updates

### Frontend Features
- **Modern UI**: Built with React 18 and Tailwind CSS
- **State Management**: React Query for server state, Context API for client state
- **Authentication**: Secure login/logout with token management
- **Responsive Design**: Mobile-first responsive design
- **Real-time Updates**: Live notifications and data updates
- **Form Handling**: React Hook Form with validation
- **AI-Powered Chat**: Intelligent symptom checker and healthcare guidance
- **Patient-Doctor Chat**: Real-time communication between patients and doctors
- **Dynamic Data**: Fully connected to backend API (except doctor data which remains static)

## 📁 Project Structure

```
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB/Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Utility functions
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ChatBot.jsx # AI-powered symptom checker
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   ├── Layout.jsx  # Main layout component
│   │   │   ├── NetworkStatus.jsx # Network status indicator
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── doctor/     # Doctor dashboard pages
│   │   │   └── patient/    # Patient dashboard pages
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom React Query hooks
│   │   ├── services/       # API services and real-time
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Medical data configuration
│   ├── package.json        # Frontend dependencies
│   └── env.example         # Environment variables template
└── README.md               # This file
```

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 📦 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd healthcare-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_system
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Healthcare Management System
```

## 🚀 Running the Application

### Development Mode

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start Backend Server**:
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

3. **Start Frontend Development Server**:
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Start Backend in Production**:
```bash
cd backend
npm start
```

## 🔐 Demo Accounts

### Doctor Account (Static Data)
- **Email**: `doctor@demo.com`
- **Password**: `demo123`
- **Role**: Doctor
- **Specialization**: Cardiology

> **Note**: Doctor data remains static for demonstration purposes. All other data (patients, appointments, notifications, medicines) is dynamic and connected to the backend API.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/doctor/:id/availability` - Get doctor availability

### Medicines
- `GET /api/medicines` - Get medicines
- `POST /api/medicines` - Create medicine (Admin)
- `PUT /api/medicines/:id` - Update medicine (Admin)
- `GET /api/medicines/track/:batchNumber` - Track medicine
- `GET /api/medicines/expiring` - Get expiring medicines (Admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 👥 User Roles & Permissions

### Patient
- Book appointments with doctors
- View their appointment history
- Chat with assigned doctors
- Track medicine supply chain
- Receive real-time notifications
- Use AI symptom checker

### Doctor
- View and manage appointments
- Update appointment status
- Chat with patients
- Manage patient information
- Receive appointment notifications
- Access patient medical history

### Admin
- Manage all users (patients, doctors, admins)
- Create and manage medicines
- View system analytics
- Manage medical data configuration
- Monitor system-wide notifications

## 🗄️ Database Schema

### User Model
- Basic info (name, email, password)
- Role-based fields (specialization for doctors)
- Medical history (for patients)
- Contact information
- Profile settings

### Appointment Model
- Patient and doctor references
- Date, time, and duration
- Status tracking (pending, confirmed, completed, cancelled)
- Symptoms and diagnosis
- Prescription information
- AI analysis results

### Medicine Model
- Medicine details (name, manufacturer, batch)
- Supply chain stages
- Blockchain hash for tracking
- Storage conditions
- Expiration dates

### Notification Model
- User reference
- Message content
- Type and priority
- Read status
- Timestamp

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Role-based access control
- Network error handling
- Offline data fallback

## 🌐 Real-time Features

- **WebSocket Integration**: Real-time communication between patients and doctors
- **Live Notifications**: Instant updates for appointments, messages, and system events
- **Network Status**: Automatic detection of online/offline status
- **Offline Support**: Graceful handling when backend is unavailable

## 🧠 AI Features

- **Symptom Checker**: AI-powered analysis of patient symptoms
- **Doctor Recommendations**: Intelligent matching of symptoms to doctor specializations
- **Urgency Assessment**: Automatic determination of appointment urgency
- **Healthcare Guidance**: AI chatbot for general health questions

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Dark/Light Mode**: User preference support
- **Accessibility**: WCAG compliant design
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🔧 Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Socket.io** - Real-time communication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 🚀 Deployment

### Deploy to Railway
1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   railway up
   ```

3. **Configure Environment Variables**:
   - MongoDB URI (optional for demo mode)
   - JWT_SECRET
   - Other required environment variables

### Configuration Files
- `railway.json` - Railway deployment configuration
- `.gitignore` - Protects sensitive credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@healthcare-system.com or create an issue in the repository.

## 🔄 Recent Updates

- ✅ **Cleaned up unused files** - Removed unused components and documentation
- ✅ **Dynamic data integration** - All data now comes from API (except doctor data)
- ✅ **Real-time chat** - Patient-doctor communication system
- ✅ **AI symptom checker** - Intelligent healthcare guidance
- ✅ **Network error handling** - Graceful offline support
- ✅ **Responsive design** - Mobile-first approach
- ✅ **Security enhancements** - JWT authentication and role-based access

---

**Built with ❤️ for better healthcare management**