⚙️ FLOW SUMMARY
🧑‍💼 Admin (Superuser)

Core powers:

Dashboard:
Total gyms, total users, revenue (today / month / total), pending gyms, active gyms.
Charts: revenue trend, new member signups, churn rate.

Gym Management:
View all gyms, approve/reject gyms, see owner info, ban gym (suspends API access).
Deep view → list of members, revenue, transactions, plan breakdown.

User Management:
View users globally (across all gyms), ban, delete, or assign test gym.

Payment Control:
Handle payments through Razorpay Connect (recommended) — direct payouts to gym owners’ linked accounts.
Take your platform commission (e.g., 5–10%) automatically.

Support Center:
Ticket system where gyms or members raise support queries (stored in DB, replied by admin).

Reports & Analytics:
Export CSVs for payments, gym performance, etc.

Later, add: coupons, platform announcements, gym verification (KYC).

🏋️ Gym Owner Portal

Purpose: Manage their gym like a mini-business.

Core features:

Dashboard: Active members, expiring memberships, monthly revenue, pending cash requests.

Gym Setup: Logo, address, contact, operating hours, linked bank account (for payouts).

Plan Management: CRUD for membership plans (price, duration, description).
Plan visibility → public (available for users to buy).

Member Management:

Add members manually (cash or offline).

Search by Member ID or name.

Approve join requests (both online payment and cash).

Suspend or delete member.

Attendance: Check-in system (manual now, QR later).

Payments:

See all transactions (online via Razorpay, cash recorded manually).

Add cash payments manually.

Track total revenue, platform fee, net payout.

Support: Contact admin via chat/ticket.

🧍‍♂️ Member (User) Portal

Purpose: Join gyms, manage profile, payments, and memberships.

Core features:

Profile: Upload photo, personal info (name, DOB, contact, health info).

Gym Discovery: See available gyms (approved ones).

Join Flow:

Choose gym → choose plan → pay (via Razorpay) → instant access.

Or choose “Pay in Cash” → sends request to gym owner for approval.

Membership Overview:
Current gym, plan name, expiry date, renewal button.

Payment History: Razorpay + cash entries visible.

Attendance Log: (later) view daily check-in history.

Support: Raise ticket to gym owner or platform admin.