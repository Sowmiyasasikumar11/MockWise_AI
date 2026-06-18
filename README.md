# MockWise AI

> **AI-Powered Interview Preparation Platform**

MockWise AI helps candidates prepare for technical and HR interviews using AI-generated questions, real-time feedback, resume analysis, and performance evaluation.

---

## ✨ Features

| Module | Description | Status |
|--------|-------------|--------|
| 🔐 Authentication | Register, Login, JWT-based sessions | ✅ Live |
| 🧭 Onboarding | Multi-step profile setup with role + skills selection | ✅ Live |
| 📊 Dashboard | Personalized stats, interview modules overview | ✅ Live |
| 🧠 Aptitude Module | Dynamic logic & quantitative reasoning tests | ✅ Live |
| 💻 Coding Module | DSA problems with real-time AI evaluation | ✅ Live |
| 📄 Resume Analyzer | AI analysis & improvement suggestions | 🔜 Coming Soon |
| 🎤 HR Interview | Behavioral questions & STAR method practice | 🔜 Coming Soon |

---

## 🗂️ Project Structure

```
MockWise AI/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register, Onboarding, Profile
│   │   │   └── dashboard/   # Dashboard
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── services/        # API service layer
│   │   └── styles/          # Global CSS
│   └── index.html
└── server/                  # Node.js + Express backend
    ├── controllers/         # Route handlers
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    ├── middleware/          # Auth, error handling, rate limiting
    ├── config/              # DB connection
    ├── utils/               # JWT helpers
    └── uploads/             # Uploaded resume files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Server Setup
```bash
cd server
npm install
# Copy .env and fill in your values
npm run dev
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mockwise
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

---

## 🔀 Auth Flow

```
/ (Login)  →  Authenticate
                ├── isProfileComplete = false  →  /onboarding
                └── isProfileComplete = true   →  /dashboard

/register  →  Create Account  →  /onboarding  →  /dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcryptjs |
| File Upload | Multer |
| AI | Google Generative AI (Gemini) |

---

*MockWise AI — AI-Powered Interview Preparation Platform*
