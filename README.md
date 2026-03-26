# ALU FoodShare Platform

A comprehensive food sharing and sustainability platform for ALU students, designed to reduce food waste and support the community.

## 🎯 Overview

ALU FoodShare is a web application that connects students who have excess food with those in need. The platform promotes food sustainability, reduces waste, and builds community connections through food sharing.

## 🚀 Features

### For Students (Users)
- **Food Sharing**: Donate excess food to fellow students
- **Food Requests**: Request specific food items when needed
- **Community Forum**: Share tips, stories, and connect with peers
- **Impact Tracking**: View CO2 savings and impact points from food sharing
- **Notifications**: Real-time updates on food matches and community activity

### For Administrators
- **System Monitoring**: Real-time dashboard with platform analytics
- **Content Moderation**: Tools to moderate food listings and community posts
- **User Management**: Role-based access control (Student ↔ Moderator ↔ Admin)
- **Audit Logs**: Complete tracking of all administrative actions
- **Reporting**: Comprehensive analytics and activity reports

## 🏗️ Architecture

### Frontend (Angular)
- **Framework**: Angular 21+
- **Styling**: SCSS with custom component-based styling
- **State Management**: Signal-based reactive state
- **Routing**: Client-side routing with role-based guards
- **Authentication**: JWT-based authentication with automatic token refresh

### Backend (Node.js/Express)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with role-based middleware
- **Security**: CORS, input validation, and rate limiting
- **API**: RESTful API with comprehensive error handling

## 📋 System Requirements

### Backend Requirements
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Frontend Requirements
- Node.js 18+
- Angular CLI 21+
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** version 18 or higher
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** version 12 or higher
- **Git** for version control

### Step 1: Clone the Repository
```bash
# Clone the repository to your local machine
git clone https://github.com/your-username/alu-foodshare.git

# Navigate into the project directory
cd alu-foodshare

# Verify you're in the correct directory
ls -la
# You should see: backend/ frontend/ README.md package.json
```

### Step 2: Set Up PostgreSQL Database
```bash
# Start PostgreSQL service (method varies by OS)

# On Windows (if using pgAdmin or similar):
# 1. Open pgAdmin
# 2. Right-click "Databases" → "Create" → "Database"
# 3. Name it "alu_foodshare" (or your preferred name)

# On macOS with Homebrew:
brew services start postgresql
createdb alu_foodshare

# On Linux:
sudo systemctl start postgresql
sudo -u postgres createdb alu_foodshare
```

### Step 3: Configure Backend Environment
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file from template
cp .env.example .env

# Edit the .env file with your database credentials
# Use any text editor (nano, vim, VS Code, etc.)
code .env
```

**Environment Variables Configuration:**
```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alu_foodshare
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Authentication
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Admin Setup
ADMIN_SIGNUP_CODE=your_admin_signup_code_change_this
```

### Step 4: Set Up Database Tables
```bash
# Start the backend server (this will create database tables)
npm run dev

# You should see output like:
# "PostgreSQL Connected"
# "Database tables synced"
# "Server running on port 3000"

# Keep this terminal running (don't close it)
# This is your backend server
```

### Step 5: Configure Frontend
```bash
# Open a new terminal window/tab
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm start
```

**Frontend Server Output:**
```
Angular Live Development Server is listening on http://localhost:4200
Application is running at http://localhost:4200
```

### Step 6: Verify Installation
```bash
# Open your web browser and navigate to:
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000/api/health

# You should see:
# - Frontend: ALU FoodShare landing page
# - Backend: {"status":"OK","message":"ALU FoodShare API is running"}
```

### Step 7: Create Admin Account
```bash
# To create an admin account, you can:
# 1. Use the registration form with the admin signup code
# 2. Or use the seed script if available

# Check if seed.js exists in backend
cd ../backend
node seed.js
# This will create a default admin user
```

### Step 8: Test the Application
1. **Register a User**: Go to http://localhost:4200/register
2. **Login**: Use your credentials at http://localhost:4200/login
3. **Test Features**: Try creating a food listing, making a request, or posting in community
4. **Admin Panel**: If you have admin access, navigate to the admin section

### Troubleshooting Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
# On macOS/Linux:
pg_isready -h localhost -p 5432

# On Windows:
# Check Services → PostgreSQL → Running
```

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill the process if needed
kill -9 $(lsof -ti:3000)
```

#### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Loading
```bash
# Verify .env file exists and has correct permissions
ls -la .env

# Check if variables are properly set
echo $DB_HOST  # Should show your database host
```

### Step 9: Development Workflow
```bash
# Always run these commands in separate terminal windows:

# Terminal 1: Backend server
cd backend
npm run dev

# Terminal 2: Frontend server  
cd frontend
npm start

# Terminal 3: Optional - for running tests or other commands
cd backend  # or cd frontend
# Run your commands here
```

### Step 10: Stopping the Application
```bash
# To stop the servers:
# Press Ctrl+C in each terminal window where servers are running

# To completely shut down:
# Close all terminal windows
# Or kill all Node.js processes:
pkill -f "node"
```

### Quick Start Commands Summary
```bash
# Clone and setup
git clone https://github.com/your-username/alu-foodshare.git
cd alu-foodshare

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev  # Keep running

# Frontend setup (in new terminal)
cd ../frontend
npm install
npm start    # Keep running

# Access application
# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

## 🔐 Authentication & Roles

### User Roles
1. **Student**: Basic user with food sharing and requesting capabilities
2. **Moderator**: Can moderate content and view system activity
3. **Admin**: Full system access including user management

### Authentication Flow
1. User registration with email verification
2. JWT token generation on login
3. Automatic token refresh
4. Role-based access control on all endpoints

## 📱 User Guide

### For Students

#### Creating a Food Listing
1. Navigate to "Donate" section
2. Fill in food details (title, description, quantity, category)
3. Set pickup location and expiration date
4. Add dietary information if applicable
5. Submit listing

#### Requesting Food
1. Browse available food listings
2. Use search and filters to find specific items
3. Click "Request" on desired listing
4. Wait for donor approval

#### Using the Community Forum
1. Navigate to "Community" section
2. Create posts to share tips or stories
3. Engage with other students' posts
4. Use different post types (Tip, Story, Discussion)

### For Administrators

#### Accessing Admin Panel
1. Log in with admin credentials
2. Navigate to "Admin" section in navbar
3. Access various admin tools and dashboards

#### Moderation Tools
1. **Content Moderation**: Review and remove inappropriate listings/posts
2. **User Management**: Promote/demote users between roles
3. **Audit Logs**: Track all administrative actions
4. **System Monitoring**: Monitor platform activity and metrics

## 🎨 UI Components

### Key Components
- **Navbar**: Navigation with role-based menu items
- **Food Card**: Display individual food listings
- **Admin Layout**: Container for all admin functionality
- **Community Posts**: Forum-style post display
- **Notifications**: Real-time notification system

### Styling System
- **CSS Variables**: Consistent theming across components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Mode Support**: Theme switching capability

## 🔧 API Reference

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Food Management Endpoints
- `GET /api/food` - List available food
- `POST /api/food` - Create food listing
- `PUT /api/food/:id` - Update food listing
- `DELETE /api/food/:id` - Delete food listing
- `POST /api/food/:id/claim` - Claim food item

### Community Endpoints
- `GET /api/community` - List community posts
- `POST /api/community` - Create community post
- `POST /api/community/:id/like` - Like a post
- `POST /api/community/:id/comment` - Add comment

### Admin Endpoints
- `GET /api/admin/overview` - Admin dashboard data
- `GET /api/admin/users` - User management
- `GET /api/admin/audit-logs` - Audit trail
- `DELETE /api/admin/moderation/posts/:id` - Remove post
- `DELETE /api/admin/moderation/listings/:id` - Remove listing

## 🚀 Deployment

### Production Setup
1. Set up production environment variables
2. Configure SSL certificates
3. Set up reverse proxy (nginx)
4. Configure database backups
5. Set up monitoring and logging

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access services
# Frontend: http://localhost:4200
# Backend: http://localhost:3000
# Database: localhost:5432
```

## 🔍 Monitoring & Maintenance

### Admin Dashboard Metrics
- Total users and active users
- Food listings (available, claimed, expired)
- Community engagement (posts, comments, likes)
- System notifications and alerts
- Daily activity trends

### Security Best Practices
- Regular password updates
- Two-factor authentication (recommended)
- Regular security audits
- Database backup schedules
- API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow existing code patterns
- Use TypeScript for type safety
- Write comprehensive tests
- Update documentation for new features

## 🐛 Bug Reports

To report a bug:
1. Check existing issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 📞 Support

For support and questions:
- Create a GitHub issue
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ALU Community for feedback and testing
- Open source contributors
- Food sustainability advocates

---

**Built with ❤️ for the ALU Community**

For more information, visit our project documentation or contact the development team.
