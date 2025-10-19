# System Flow Summary

## 👑 Admin (Superuser)

### Core Powers

#### Dashboard
- Total gyms, total users, revenue (today/month/total)
- Pending gyms, active gyms
- Charts:
  - Revenue trend
  - New member signups 
  - Churn rate

#### Gym Management
- View all gyms
- Approve/reject gyms
- See owner info
- Ban gym (suspends API access)
- Deep view:
  - List of members
  - Revenue
  - Transactions
  - Plan breakdown

#### User Management
- View users globally (across all gyms)
- Ban users
- Delete users
- Assign test gym

#### Payment Control
- Handle payments via Razorpay Connect
  - Direct payouts to gym owners' linked accounts
  - Automatic platform commission (5-10%)

#### Support Center
- Ticket system for gyms/members
- Store queries in DB
- Admin replies

#### Reports & Analytics
- Export CSVs for:
  - Payments
  - Gym performance

#### Future Features
- Coupons
- Platform announcements
- Gym verification (KYC)

## 💪 Gym Owner Portal

### Purpose
Manage gym like a mini-business

### Core Features

#### Dashboard
- Active members
- Expiring memberships
- Monthly revenue
- Pending cash requests

#### Gym Setup
- Logo
- Address
- Contact
- Operating hours
- Linked bank account (payouts)

#### Plan Management
- CRUD membership plans
  - Price
  - Duration
  - Description
- Plan visibility settings

#### Member Management
- Add members manually
- Search by Member ID/name
- Approve join requests
- Suspend/delete members
- Attendance tracking

#### Payments
- View all transactions
- Add cash payments
- Track:
  - Total revenue
  - Platform fee
  - Net payout

#### Support
- Contact admin via chat/ticket

## 👤 Member (User) Portal

### Purpose
Join gyms, manage profile/payments/memberships

### Core Features

#### Profile
- Photo upload
- Personal info:
  - Name
  - DOB
  - Contact
  - Health info

#### Gym Discovery
- View approved gyms

#### Join Flow
1. Choose gym
2. Select plan
3. Payment options:
   - Online (Razorpay) → instant access
   - Cash → await owner approval

#### Membership Overview
- Current gym
- Plan details
- Expiry date
- Renewal option

#### Payment History
- Razorpay transactions
- Cash payments

#### Future Features
- Attendance log
- Daily check-in history

#### Support
- Raise tickets to:
  - Gym owner
  - Platform admin
