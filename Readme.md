# ORDIIN

A scalable multi-tenant gym management system with separate portals for admins, gym owners, and members.

## Architecture

- **Backend**: Express.js with MongoDB
- **Frontend**: React (Vite) with Ant Design
- **Authentication**: JWT-based with role-based access control
- **Payment**: Razorpay integration
- **Multi-tenant**: Gym-isolated data with admin oversight

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and secrets
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented

### 🧑💼 Admin Portal
- Dashboard with key metrics
- Gym approval/rejection system
- User management across all gyms
- Revenue tracking and analytics

### 🏋️ Gym Owner Portal
- Gym registration and setup
- Membership plan management
- Member management and approval
- Payment tracking

### 🧍♂️ Member Portal
- Gym discovery and joining
- Membership management
- Payment history
- Profile management

## Database Models

- **User**: Authentication and profile data
- **Gym**: Gym information and settings
- **Plan**: Membership plans per gym
- **Member**: Gym memberships and status
- **Payment**: Transaction tracking
- **SupportTicket**: Customer support system

## Security Features

- JWT authentication with role-based access
- Request rate limiting
- Helmet security headers
- Multi-tenant data isolation
- Input validation and sanitization

## Scalability Features

- Tenant-aware architecture
- Modular route structure
- Efficient database queries with population
- Proxy setup for API calls
- Component-based frontend architecture

## Next Steps

1. Install dependencies and start development servers
2. Set up MongoDB database
3. Configure Razorpay credentials
4. Implement remaining dashboard features
5. Add payment integration
6. Implement support ticket system
7. Add file upload for gym logos and user photos
8. Implement attendance tracking
9. Add email notifications
10. Deploy to production

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/gyms` - List all gyms
- `PATCH /api/admin/gyms/:id/status` - Update gym status

### Gym Owner Routes
- `POST /api/gym` - Create gym
- `GET /api/gym/dashboard` - Gym dashboard
- `POST /api/gym/plans` - Create membership plan
- `GET /api/gym/plans` - List gym plans

### User Routes
- `GET /api/user/gyms` - List approved gyms
- `GET /api/user/gyms/:id/plans` - Get gym plans
- `POST /api/user/join` - Join gym
- `GET /api/user/memberships` - User memberships