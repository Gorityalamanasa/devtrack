# 🚀 DevTrack – Developer Productivity Dashboard

A full-stack **GitHub Developer Analytics Platform** that helps developers analyze GitHub profiles, compare productivity, and visualize coding activity through an interactive dashboard.

---

## 🌐 Live Demo

> https://devtrack-242424.vercel.app

## 📂 GitHub Repository

> https://github.com/Gorityalamanasa/devtrack

---

# 📌 Project Overview

DevTrack analyzes GitHub developer profiles using the GitHub REST API and presents meaningful productivity insights through an interactive dashboard.

The application enables users to:

- Analyze any public GitHub profile
- Compare multiple developers
- Visualize coding activity
- Track repository quality and influence
- Understand overall developer productivity using a weighted scoring algorithm

---

# ✨ Features

- 🔐 JWT Authentication
- 👤 GitHub Profile Analysis
- 📊 Developer Productivity Dashboard
- 📈 Interactive Charts using Recharts
- 🔍 Search Any GitHub Username
- ⚔️ Compare Multiple Developers
- 📂 Repository Analysis
- 🌍 Language Distribution
- ⭐ Repository Quality & Influence Scoring
- 📱 Responsive User Interface

---

# 🛠️ Tech Stack

## Frontend
- React.js
- JavaScript
- CSS
- Recharts

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## APIs
- GitHub REST API

## Authentication
- JWT (JSON Web Token)

## Deployment
- Frontend: Vercel
- Backend: Render

---

# 🏗️ System Workflow

```text
User Login
        ↓
JWT Authentication
        ↓
Enter GitHub Username
        ↓
Frontend sends API Request
        ↓
Backend calls GitHub REST API
        ↓
Repository & Profile Data Retrieved
        ↓
Developer Score Calculated
        ↓
Charts & Insights Generated
        ↓
Interactive Dashboard Displayed
```

---

# 📊 Developer Scoring Algorithm

Developer productivity is calculated using multiple factors:

- Repository Quality
- Coding Activity
- Followers & Influence
- Programming Languages
- Repository Statistics

These metrics are combined to generate an overall developer productivity score.

---

# 🔐 Authentication Flow

```text
User Login
      ↓
Backend Verifies Credentials
      ↓
JWT Token Generated
      ↓
Token Stored on Client
      ↓
Protected API Requests
```

---

# 📡 REST API Highlights

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/github/profile/:username`
- GET `/api/github/compare`
- GET `/api/dashboard`

---

# 📂 Project Structure

```text
client/
├── src/
├── components/
├── pages/

server/
├── controllers/
├── routes/
├── middleware/
├── models/
├── services/
├── config/
```

---

# ⚙️ Installation

```bash
git clone https://github.com/Gorityalamanasa/devtrack.git

cd devtrack

cd client
npm install

cd ../server
npm install
```

### Start Backend

```bash
cd server
node index.js
```

### Start Frontend

```bash
cd client
npm start
```

---

# 🔑 Environment Variables

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GITHUB_TOKEN=your_github_personal_access_token
```

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- GitHub Profile Analysis
- Developer Comparison
- Charts & Analytics

---

# 💡 Future Enhancements

- AI-based code review insights
- Repository trend prediction
- Export dashboard reports
- Team productivity analytics
- GitHub contribution forecasting

---

# 👨‍💻 Author

**Gorityala Manasa**

If you found this project useful, consider ⭐ starring the repository.
