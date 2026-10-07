# ⚡ VELOOP Rewards — Daily Streak System

<p align="center">
  <img src="frontend/public/assets/Bigger_Streak.png" alt="VELOOP Daily Streak" width="700"/>
</p>

<p align="center">
  <strong>A secure, backend-driven Daily Streak & Rewards platform built with MERN.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-orange?logo=jsonwebtokens" alt="JWT"/>
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite" alt="Vite"/>
</p>

---

## 📌 Project Overview

**VELOOP Rewards** is a full-stack MERN application that implements a **7-day Daily Streak reward system**.

Users can log in, maintain a daily streak, claim rewards sequentially, earn VEs Coins or Amazon Gift Card rewards, and track their wallet and transaction history.

The main focus of the project is that **the backend remains the single source of truth**.

The frontend does not decide:

* Current streak
* Current reward day
* Reward amount
* Reward currency/type
* Claim eligibility
* Timer authority
* Missed-day reset
* Wallet balance
* Transaction validity
* User identity

All important business rules are validated and executed on the backend.

---

# ✨ Key Features

## 🔐 Authentication

* Local email/password authentication
* Google Sign-In using Google Identity Services
* JWT-based authentication
* Protected API routes
* Demo/Guest access without requiring registration
* User identity is taken from the authenticated session
* Cross-user access protection

---

## 🔥 7-Day Daily Streak

The system contains seven sequential rewards:

| Day   | Reward                 |
| ----- | ---------------------- |
| Day 1 | 🪙 +5 VEs              |
| Day 2 | 🪙 +10 VEs             |
| Day 3 | 🪙 +15 VEs             |
| Day 4 | 🎁 ₹1 Amazon Gift Card |
| Day 5 | 🎁 ₹2 Amazon Gift Card |
| Day 6 | 🪙 +30 VEs             |
| Day 7 | 🏆 ₹5 Amazon Gift Card |

Rewards are configured on the backend/database rather than being trusted from the React client.

---

## 🎯 Claim System

A user can claim a reward only when the backend determines that:

* The user is authenticated.
* The current streak is valid.
* The requested reward day is actually claimable.
* The previous required day has been completed.
* The user has not already claimed the reward.
* The claim is not duplicated.
* The current server time allows the claim.
* The streak has not expired.

The client cannot simply send:

```text
day = 7
reward = ₹5
amount = 5
```

and receive the reward.

The backend determines the actual reward.

---

# 🧠 Backend-Driven Architecture

One of the most important design decisions in this project is:

> **Frontend displays the state. Backend owns the state.**

### Frontend

Responsible for:

* UI
* Animations
* Countdown display
* User interactions
* API calls
* Loading states
* Error messages

### Backend

Responsible for:

* Authentication
* User identity
* Streak calculation
* Reward eligibility
* Claim validation
* Missed-day detection
* Streak reset
* Wallet balance
* Transactions
* Idempotency
* Audit logging
* Server time

This prevents users from manipulating rewards through browser developer tools.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │   React + Bootstrap  │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Express Server    │
                    │       Node.js        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Authentication      Streak Engine     Wallet
          Service             Service        Service
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │   Persistent Data    │
                    └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology            | Purpose                 |
| --------------------- | ----------------------- |
| React 18              | User interface          |
| Vite                  | Development/build tool  |
| React Router          | Application routing     |
| Axios                 | REST API communication  |
| Bootstrap 5           | Responsive UI           |
| CSS Modules           | Component-level styling |
| Framer Motion         | UI animations           |
| Lucide React          | Icons                   |
| JavaScript ES Modules | Application logic       |

---

## Backend

| Technology               | Purpose                   |
| ------------------------ | ------------------------- |
| Node.js                  | Backend runtime           |
| Express.js               | REST API framework        |
| MongoDB                  | Database                  |
| Mongoose                 | MongoDB ODM               |
| JWT                      | Authentication            |
| bcrypt                   | Password security         |
| Google Identity Services | Google authentication     |
| google-auth-library      | Google token verification |
| CORS                     | Cross-origin security     |
| dotenv                   | Environment configuration |
| express-rate-limit       | API rate limiting         |
| Morgan                   | HTTP request logging      |
| Nodemon                  | Development server        |

---

# 🗄️ Database Design

The application uses MongoDB with Mongoose models.

Important collections/models include:

```text
User
Wallet
WalletTransaction
StreakConfig
StreakReward
StreakCycle
StreakClaim
AuditLog
CpaEvent
```

### User

Stores:

* Name
* Email
* Password hash
* Google ID
* Authentication provider
* Profile image
* Role
* Active status
* Login information

### Wallet

Stores the user's actual wallet balance.

### WalletTransaction

Stores financial/reward ledger entries.

This provides a transaction history instead of relying on a frontend-only balance.

### StreakReward

Stores reward configuration such as:

* Day
* Reward type
* Amount
* Currency
* Metadata
* Asset information

### StreakClaim

Stores reward claim history and prevents duplicate claims.

### AuditLog

Tracks important security/business events.

Examples:

```text
STREAK_CLAIM_REQUEST
STREAK_CLAIM_SUCCESS
STREAK_CLAIM_REJECTED
STREAK_RESET
DUPLICATE_CLAIM
INVALID_CLAIM
```

---

# 🎁 Reward Configuration

The reward system is designed so that reward information comes from the backend.

Example reward configuration:

```text
Day 1 → 5 VEs
Day 2 → 10 VEs
Day 3 → 15 VEs
Day 4 → ₹1 Amazon Gift Card
Day 5 → ₹2 Amazon Gift Card
Day 6 → 30 VEs
Day 7 → ₹5 Amazon Gift Card
```

The React application consumes this configuration through the API.

This makes the system easier to modify without changing the frontend business logic.

---

# ⏱️ Server-Side Timer

The countdown shown in the UI is only a **visual representation**.

The frontend does not decide whether a reward is available.

When the countdown reaches zero, the frontend requests the latest status from the backend.

```text
Frontend Timer
      │
      ▼
Timer reaches 0
      │
      ▼
GET /api/daily-streak
      │
      ▼
Backend checks server time
      │
      ▼
Returns authoritative state
```

This prevents users from manipulating the browser clock to claim rewards early.

---

# 🔄 Daily Streak Flow

```text
Login
  │
  ▼
Daily Streak Page
  │
  ▼
GET /api/daily-streak
  │
  ▼
Backend calculates current state
  │
  ▼
Display 7 reward cards
  │
  ▼
User clicks Claim
  │
  ▼
POST /api/daily-streak/claim
  │
  ▼
Backend validates eligibility
  │
  ├── Invalid → Reject
  │
  ├── Already Claimed → Reject
  │
  ├── Missed Streak → Reset
  │
  └── Valid → Grant Reward
                  │
                  ▼
             Wallet Update
                  │
                  ▼
             Transaction
                  │
                  ▼
             Claim History
                  │
                  ▼
             Next Day Timer
```

---

# 🧩 CPA Demo Flow

The project contains a CPA demo flow for demonstration purposes.

The CPA event itself does **not** directly grant a reward.

Instead:

```text
CPA Demo
   │
   ▼
Backend validates event
   │
   ▼
Streak claim endpoint
   │
   ▼
Eligibility validation
   │
   ▼
Reward service
   │
   ▼
Wallet + Transaction
```

This maintains the separation between an external/demo event and the actual reward-granting logic.

---

# 🛡️ Security Features

Security was considered at both frontend and backend levels.

### Authentication

* JWT authentication
* Protected routes
* Authenticated user identity
* Google ID token verification
* Demo authentication

### Authorization

Users cannot claim rewards on behalf of another user.

The backend identifies the user from the authenticated token rather than trusting:

```text
userId
```

from the request body.

### Reward Protection

The client cannot authoritatively modify:

```text
day
amount
currency
reward type
streak
wallet balance
```

### Duplicate Claim Protection

The backend checks whether a reward has already been claimed.

### Concurrent Request Protection

The reward claim flow is designed to prevent multiple simultaneous requests from generating duplicate rewards.

### Rate Limiting

Sensitive authentication/demo endpoints are protected with rate limiting.

### CORS

Only configured frontend origins are allowed to communicate with the backend.

### Environment Variables

Secrets such as:

```text
MONGO_URI
JWT_SECRET
GOOGLE_CLIENT_ID
```

are stored in environment variables rather than committed to Git.

---

# 📁 Project Structure

```text
veloop-daily-streak/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── DailyStreak/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useCountdown.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── DailyStreak/
│   │   │   ├── History/
│   │   │   ├── Profile/
│   │   │   ├── Rewards/
│   │   │   ├── Settings/
│   │   │   └── Wallet/
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authApi.js
│   │   │   └── streakApi.js
│   │   │
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth/
│   │   │   ├── cpa/
│   │   │   ├── streak/
│   │   │   ├── wallet/
│   │   │   └── transaction/
│   │   │
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── seed/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── render.yaml
├── README.md
├── API_DOCUMENTATION.md
├── DATABASE.md
├── SECURITY.md
├── TESTING.md
└── .gitignore
```

---

# 🔌 Main API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/demo
GET  /api/auth/me
```

## Daily Streak

```http
GET  /api/daily-streak
POST /api/daily-streak/claim
GET  /api/daily-streak/history
```

## Wallet

```http
GET /api/wallet
```

## Transactions

```http
GET /api/transactions
```

## CPA Demo

```http
POST /api/cpa/demo
```

## Health Check

```http
GET /api/health
```

---

# 🚀 Run the Project Locally

## 1. Requirements

Before starting, install:

* Node.js
* npm
* MongoDB Atlas account or local MongoDB
* Git

Check installation:

```bash
node -v
npm -v
git --version
```

---

# 📥 2. Clone the Repository

Open terminal:

```bash
git clone https://github.com/YOUR_USERNAME/veloop-daily-streak.git
```

Move into the project:

```bash
cd veloop-daily-streak
```

---

# 📦 3. Install Backend Dependencies

```bash
cd backend
npm install
```

---

# ⚙️ 4. Configure Backend Environment

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/veloop?retryWrites=true&w=majority

JWT_SECRET=your_long_random_secret

FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173

FRONTEND_URL=http://localhost:5173

NODE_ENV=development

GOOGLE_CLIENT_ID=your_google_web_client_id
```

### Important

Do **not** commit the real `.env` file to GitHub.

Use:

```text
backend/.env.example
```

for sharing configuration structure.

---

# 🌱 5. Seed the Streak Rewards

From the backend directory:

```bash
npm run seed:streak
```

This creates/configures the Daily Streak reward data.

If the project already contains seeded data, this step may not be necessary.

---

# ▶️ 6. Start Backend

From:

```text
backend/
```

run:

```bash
npm run dev
```

You should see:

```text
MongoDB Connected
VELOOP API running on port 5000
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 💻 7. Install Frontend Dependencies

Open a **new terminal**.

From project root:

```bash
cd frontend
npm install
```

---

# ⚙️ 8. Configure Frontend Environment

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api

VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

---

# ▶️ 9. Start Frontend

Run:

```bash
npm run dev
```

Vite will provide a URL similar to:

```text
http://localhost:5173
```

Open it in your browser.

---

# ⚡ Quick Start

If everything is already configured:

### Terminal 1 — Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 👤 Demo Login

The application supports:

**Continue without Login**

This creates a backend demo session.

The demo user still uses the real backend streak and wallet logic.

The demo flow does **not** bypass:

* Reward validation
* Streak rules
* Wallet logic
* Transaction recording
* Claim protection

---

# 🧪 Testing the Streak

After logging in:

```text
1. Open Daily Streak
2. Check current streak
3. Check available reward
4. Click Claim Reward
5. Verify wallet balance
6. Verify transaction history
7. Verify claim history
8. Check next reward/timer
```

---

# 🔍 Backend Verification

You can verify API responses using:

* Browser
* Postman
* Thunder Client
* REST Client
* Frontend application

Example:

```http
GET http://localhost:5000/api/health
```

---

# 🧪 Testing Scenarios

Important scenarios covered by the application design:

### Valid Claim

```text
Eligible user
     ↓
Valid day
     ↓
Claim
     ↓
Reward granted
     ↓
Wallet updated
     ↓
Transaction created
```

### Duplicate Claim

```text
Already claimed
     ↓
Second request
     ↓
Backend rejects request
     ↓
No duplicate reward
```

### Invalid Day

```text
User attempts future reward
     ↓
Backend checks actual streak
     ↓
Request rejected
```

### Missed Day

```text
Previous reward not claimed
     ↓
Required time passes
     ↓
Backend detects missed streak
     ↓
Streak reset
```

### Cross-User Attack

```text
User A token
     ↓
Attempts User B resource
     ↓
Backend uses authenticated identity
     ↓
Request rejected
```

---

# 🎨 UI & Design

The interface follows a modern rewards/dashboard design with:

* Dark purple/violet theme
* Gold reward highlights
* Green success states
* Responsive reward cards
* Streak hero section
* Wallet balance
* Statistics
* Reward progress
* Ultimate reward section
* Trust section
* Responsive mobile layout
* Loading/skeleton states
* Error states
* Toast notifications

Provided project assets are used instead of emoji-only reward representations.

---

# 📱 Responsive Design

The application is designed for:

```text
Desktop
Tablet
Mobile
```

The reward grid and hero sections adapt according to screen size.

---

# 🧱 Design Principles

The project follows these principles:

### Backend as Source of Truth

Important business rules are never trusted from the browser.

### Separation of Concerns

```text
Controller
    ↓
Service
    ↓
Model
    ↓
Database
```

### Reusable Components

The frontend uses reusable components for:

* Reward cards
* Headers
* Statistics
* Loading states
* Footer
* Authentication
* Layout

### Secure Configuration

Secrets are stored in environment variables.

---

# ☁️ Deployment

The project includes a `render.yaml` configuration for Render deployment.

The architecture can be deployed as:

```text
                 GitHub
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Render Frontend          Render Backend
        │                       │
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
                MongoDB
                  Atlas
```

---

# 🌍 Production Environment Variables

## Backend

```env
NODE_ENV=production
PORT=5000

MONGO_URI=your_production_mongodb_uri

JWT_SECRET=your_production_jwt_secret

FRONTEND_URLS=https://your-frontend.onrender.com

FRONTEND_URL=https://your-frontend.onrender.com

GOOGLE_CLIENT_ID=your_google_client_id
```

## Frontend

```env
VITE_API_URL=https://your-backend.onrender.com/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

# 🔐 Production Security Checklist

Before deploying:

* [ ] Change JWT secret
* [ ] Use production MongoDB credentials
* [ ] Configure production CORS
* [ ] Configure Google OAuth origins
* [ ] Never upload `.env`
* [ ] Never commit passwords
* [ ] Never commit MongoDB credentials
* [ ] Never expose private API keys
* [ ] Use HTTPS
* [ ] Review rate limits
* [ ] Review database indexes
* [ ] Test duplicate claims
* [ ] Test authentication failures

---

# 📚 Documentation

Additional project documentation:

```text
README.md
API_DOCUMENTATION.md
DATABASE.md
SECURITY.md
TESTING.md
```

These documents explain the API, database structure, security considerations and testing strategy in more detail.

---

# 🧰 Development Tools

The project can be developed using:

* Visual Studio Code
* Cursor
* Git
* GitHub
* Postman
* MongoDB Atlas
* MongoDB Compass
* Chrome DevTools

---

# 🔄 Git Workflow

After making changes:

```bash
git status
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Update VELOOP Daily Streak"
```

Push:

```bash
git push origin main
```

---

# ⚠️ Important GitHub Note

Never push:

```text
.env
node_modules/
dist/
```

The repository should contain:

```text
.env.example
```

instead of the real environment files.

Example `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
build/
coverage/
*.log
.DS_Store
```

---

# 🎯 Project Goals

The main goals of VELOOP Rewards are:

* Build a production-style MERN application
* Implement a secure Daily Streak system
* Keep business logic on the backend
* Prevent reward manipulation
* Implement wallet and transaction tracking
* Provide a responsive and attractive UI
* Support authentication and demo access
* Maintain clean separation between frontend and backend
* Provide a deployment-ready architecture

---

# 🏆 What This Project Demonstrates

This project demonstrates practical experience with:

```text
React
      ↓
REST APIs
      ↓
Express.js
      ↓
Node.js
      ↓
MongoDB
```

Along with:

```text
Authentication
Authorization
JWT
Google Login
MongoDB Data Modeling
REST API Design
Backend Business Logic
Wallet Systems
Transaction Ledgers
Streak Algorithms
Idempotency
Security
Rate Limiting
Responsive UI
Deployment
Git/GitHub
```

---

# 👨‍💻 Author

**Md. Sahid Alam**

B.Tech Computer Science Engineering

Interested in:

* Full-Stack Development
* MERN Stack
* Artificial Intelligence
* Machine Learning
* Software Engineering

---

# ⭐ If You Like This Project

If this project helped you or you found it interesting:

⭐ Star the repository

🍴 Fork the repository

🐛 Open an issue

💡 Suggest improvements

---

## 📄 License

This project is intended for educational, portfolio and assignment purposes.
