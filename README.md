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

Create a `.env` file in the `server` directory and configure the following parameters:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GITHUB_TOKEN=your_github_personal_access_token
PORT=5000

# Optional configurable defaults for benchmarks
DEFAULT_AVG_FOLLOWERS=100
DEFAULT_AVG_REPOS=20
DEFAULT_AVG_STARS=50
```

---

# 🤖 AI Integration & Workflow

DevTrack connects with the free **GitHub Models API** (running GPT-4o-mini) to perform high-quality qualitative evaluation on developer profiles. 

### Architecture & Workflow:
1. **GitHub Data Fetching**: The backend fetches raw user profile and repository statistics from the GitHub REST API.
2. **Rule-Based Preprocessing**: The backend processes deterministic metrics (skills, top languages, repository quality score, activity score, influence score, overall developer score, project impact).
3. **AI Request**: The processed metrics are sent to the GitHub Models API (`gpt-4o-mini`) using the developer's existing `GITHUB_TOKEN` to obtain a qualitative classification (DNA), weakness analysis, and 3 key personalized insights.
4. **Double-Fallback Design**: If the AI API is rate-limited, fails, or has an invalid/missing token, the system automatically falls back to rule-based algorithms (`utils/analyze.js`) to provide similar evaluations. If rule-based also fails, a generic fallback is used.
5. **Dynamic Benchmarking**: Averages are computed dynamically from past search queries stored in MongoDB, allowing benchmarks to scale dynamically rather than using hardcoded values.

### Rate-Limit Handling (HTTP 429):
If the AI service returns an HTTP 429 rate limit error, the application automatically retries the request exactly once after a 1.5-second delay. If the retry also fails, it immediately triggers the rule-based fallback to preserve dashboard usability.

### Example API Response:
```json
{
  "username": "octocat",
  "topLanguage": "TypeScript",
  "skills": { "TypeScript": 15, "JavaScript": 5 },
  "impact": { "topRepo": { "name": "hello-world", "stars": 42 } },
  "activity": { "level": "High", "last7": 8, "last30": 20 },
  "score": { "total": 78, "influence": 30, "activity": 24, "quality": 24 },
  "dna": "TypeScript Architect",
  "weakness": "Project documentation could be improved.",
  "insights": [
    "Versatile developer with a robust codebase.",
    "Strong community presence and high project quality.",
    "Actively committing to public repositories."
  ],
  "aiAvailable": true,
  "aiSource": "OPENAI"
}
```
If AI fails, the response automatically returns `"aiAvailable": false` and `"aiSource": "RULE_BASED_FALLBACK"` alongside the rule-based results.

---


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
