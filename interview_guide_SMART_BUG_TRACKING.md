# Smart Bug Tracker — Interview Explanation (STAR + Tech)

---

## ⚡ 30-Second Elevator Pitch

> "I built **Smart Bug Tracker**, a full-stack bug tracking system with an automated CI/CD pipeline that solves the problem of manual software deployment. I used **Spring Boot, MySQL, Docker, and Jenkins** and was personally responsible for the entire backend architecture, role-based access control, and pipeline automation. The biggest challenge was designing a **status workflow state machine** that prevents invalid bug transitions, which I solved by defining valid transitions as an immutable map validated at the service layer. By the end, the system has **12 REST endpoints, 13 automated tests**, and a **6-stage Jenkins pipeline** where a single git push builds, tests, containerizes, and deploys the app with zero manual steps."

---

## 🔄 Complete Project Workflow (End-to-End)

### How the entire system works — from code to user:

```
Developer writes code
       ↓
  git push to GitHub
       ↓
  Jenkins detects push (webhook)
       ↓
  Stage 1: Checkout — pulls latest code
       ↓
  Stage 2: Build — mvn clean compile (compiles Java code)
       ↓
  Stage 3: Test — mvn test (runs 13 tests using H2 in-memory DB)
       ↓          ↘ If tests fail → pipeline STOPS, broken code never deployed
  Stage 4: Package — mvn package (creates JAR file)
       ↓
  Stage 5: Docker Build — builds container image from Dockerfile
       ↓
  Stage 6: Deploy — docker-compose up -d (starts the container)
       ↓
  App running at localhost:8080 with MySQL database
       ↓
  User opens browser → Spring Boot serves index.html
       ↓
  JavaScript calls REST API → Controller → Service → Repository → MySQL
       ↓
  Data displayed on screen ✅
```

### How a user request flows through the app:

```
User clicks "Create Issue" on the UI
       ↓
JavaScript (app.js) sends POST /api/issues with JSON body
       ↓
Spring Boot routes it to IssueController.createIssue()
       ↓
Controller calls IssueService.createIssue()
       ↓
Service sets status = NEW (business rule)
       ↓
Service calls IssueRepository.save(issue)
       ↓
Spring Data JPA generates INSERT SQL → sends to MySQL
       ↓
MySQL stores the row in the "issues" table
       ↓
Response (201 Created + JSON) sent back to browser
       ↓
JavaScript renders the new issue on screen with toast notification
```

### How the status workflow works:

```
Bug reported → [NEW]
       ↓ Admin assigns to developer
      [OPEN]  (auto-transition on assignment)
       ↓ Developer starts working
      [IN_PROGRESS]
       ↓ Developer fixes it
      [RESOLVED]
       ↓ Tester verifies the fix
      [CLOSED] ✅
       
       ↗ If fix is rejected → back to [OPEN]
       ↗ If closed bug reappears → reopen to [OPEN]
```

### How RBAC works on each request:

```
User clicks "Delete Issue"
       ↓
JavaScript sends DELETE /api/issues/5
  + Header: X-Acting-User-Id: 2
       ↓
IssueController.deleteIssue() runs
       ↓
Looks up user 2 → finds "john_dev" → role = DEVELOPER
       ↓
DEVELOPER ≠ ADMIN → returns 403 FORBIDDEN
       ↓
"Only ADMIN can delete issues" error shown
```

---

## 🗣️ Step-by-Step Explanation

### Step 1 — Open with the Problem (15 sec)

> "In real software teams, two things break the most — **bug tracking workflows** where people skip steps or change statuses randomly, and **manual deployments** where someone forgets to test before pushing to production. I wanted to build a system that solves both — a bug tracker with enforced workflows, and a pipeline that automates the entire build-to-deploy process."

**Why this works**: You're not saying "I built a website." You're showing you understand real industry problems.

---

### Step 2 — Your Role (10 sec)

> "This is a solo project — I designed and built everything: the backend architecture, the REST API, the database schema, the frontend UI, the Docker containerization, and the Jenkins CI/CD pipeline."

**Why this works**: No ambiguity. The interviewer knows YOU did all of it.

---

### Step 3 — Tech Choices with Justification

> **"I used Spring Boot"** — because it gives me a production-ready backend with built-in dependency injection, auto-configuration, and embedded Tomcat — no manual server setup. It also serves my frontend files automatically from the `/static` directory.

> **"I chose MySQL"** — because bug tracking data has clear relationships — issues belong to users, comments belong to issues. Data persists across restarts and is visible in MySQL Workbench. I also kept **H2 for testing** so the Jenkins pipeline runs without needing a database.

> **"Frontend is vanilla HTML/CSS/JS"** — the focus of this project is DevOps, not frontend frameworks. The files sit inside `src/main/resources/static/` and Spring Boot serves them automatically — when a user opens `localhost:8080`, Spring Boot sends `index.html`, which loads `style.css`, `api.js`, and `app.js`. JavaScript makes `fetch()` calls to the REST API and dynamically renders views without page reloads — a Single Page Application.

> **"I used Docker"** — to containerize the app so it runs the same everywhere — my machine, Jenkins, production. The image uses **JRE, not JDK** — smaller and more secure.

> **"Jenkins for CI/CD"** — because it's the industry standard for pipeline automation. My Jenkinsfile defines a **6-stage declarative pipeline** that goes from code checkout to deployment automatically.

**Why this works**: You're not listing tools — you're showing **why** you picked each one. This shows engineering maturity.

---

### Step 4 — Highlight Challenges You Solved ⭐

#### Challenge 1: Status Workflow Enforcement
> "The trickiest part was preventing invalid status changes. Initially, anyone could change a bug from NEW directly to CLOSED, skipping the entire workflow. I solved it by designing a **state machine** — a Map where each status maps to its allowed next statuses. For example, NEW can only go to OPEN or CLOSED, IN_PROGRESS can only go to RESOLVED or back to OPEN. If someone tries an invalid transition, the service layer throws an `IllegalStateException` — even direct API calls can't bypass it."

#### Challenge 2: Role-Based Access Control
> "I implemented **three-tier RBAC** — Admin has full access, Developers can only edit issues they own or are assigned to, and Testers can only verify or reopen bugs. The challenge was handling edge cases — like what happens when a Developer tries to edit an issue they didn't report AND aren't assigned to. I solved it with a combination of role checks and ownership checks in the controller layer."

#### Challenge 3: Java Version Mismatch in CI/CD
> "My local machine had Java 23, but Jenkins had Java 17. The JAR wouldn't run in the pipeline. I fixed it by targeting Java 17 in the pom.xml and using `eclipse-temurin:17-jre-jammy` as the Docker base image — everything aligned."

#### Challenge 4: Dual Database Setup
> "I needed MySQL for production but the Jenkins pipeline shouldn't depend on a running database during tests. I solved it using **Spring profiles** — `src/main/resources/application.properties` points to MySQL, and `src/test/resources/application.properties` points to H2 in-memory. Spring Boot automatically picks the right config depending on context."

**Why this works**: These aren't generic struggles. These are **specific technical problems with specific solutions**.

---

### Step 5 — End with Impact / Results

> "The final system has:
> - **12 REST endpoints** with full CRUD, filtering, and dashboard stats
> - **13 automated tests** — 7 integration tests with MockMvc, 5 service-layer tests, 1 context test
> - A **6-stage Jenkins pipeline** — Checkout → Build → Test → Package → Docker Build → Deploy
> - **3 roles** with granular permissions enforced both server-side and in the UI
> - **5-stage bug lifecycle** with state machine validation
> - Data persisted in **MySQL** — visible in MySQL Workbench, survives restarts
> - If any test fails, the pipeline **stops** — broken code never reaches production"

**Why this works**: Numbers make it real. "13 tests" is more impressive than "I wrote tests."

---

## ✅ Power Phrases for YOUR Project

| Instead of this ❌ | Say this ✅ |
|---|---|
| "I made a bug tracking app" | "I built a bug tracking system with an automated DevOps pipeline" |
| "I used Docker" | "I containerized the app with Docker using a JRE base image for a smaller attack surface" |
| "I added roles" | "I implemented three-tier RBAC where Developers can only modify issues they own" |
| "I used Jenkins" | "I wrote a 6-stage declarative Jenkins pipeline that automates build-to-deploy" |
| "I validated status" | "I designed a state machine that enforces valid workflow transitions at the service layer" |
| "I used MySQL" | "I used MySQL for production and H2 for testing — so the CI pipeline runs without a database dependency" |
| "The frontend is basic" | "It's a Single Page Application — Spring Boot serves static files and JavaScript dynamically renders views via REST API calls" |
| "It's not fully done" | "The core system is complete — I'd add Spring Security with JWT and a staging environment next" |

---

## 💡 Likely Follow-up Questions & Answers

**"What would you do differently if you rebuilt it?"**
> "Three things — I'd use **Spring Security with JWT** for proper authentication, **Flyway** for versioned database migrations, and I'd add a **staging environment** in the pipeline before production."

**"How does the state machine work under the hood?"**
> "It's an immutable `Map<Status, Set<Status>>` in the IssueService. When `changeStatus()` is called, it looks up the current status, checks if the new status is in the allowed set, and throws `IllegalStateException` if not. Validation is server-side — the UI can't bypass it."

**"How would you scale this?"**
> "Run multiple app instances behind a **load balancer**, MySQL is already external so all instances share state, add **Redis** for caching dashboard stats and session management, and use **Prometheus + Grafana** for monitoring."

**"What was your biggest learning?"**
> "That DevOps isn't just about knowing Docker or Jenkins individually — it's about making them work together as a **cohesive pipeline**. One git push triggers 6 automated stages, and if any stage fails, everything stops. That fail-fast principle was my biggest takeaway."

**"How does Spring Boot serve the frontend?"**
> "Any files inside `src/main/resources/static/` are automatically served by Spring Boot. When a user opens `localhost:8080`, Spring Boot sends `index.html`. That HTML loads CSS and JavaScript files, and the JavaScript makes `fetch()` calls to my REST API endpoints to get data and render it dynamically — all on one page without reloads."

**"Why MySQL and not H2 for everything?"**
> "H2 is in-memory — data is lost when the app stops. MySQL persists data permanently, so issues, users, and comments survive restarts. I can also see and query the data in MySQL Workbench for debugging. For tests, I kept H2 because it's fast and doesn't need a running database server."

**"Explain your Dockerfile"**
> "JRE base image for smaller size, COPY the JAR, EXPOSE 8080, HEALTHCHECK that pings my `/api/health` endpoint every 30 seconds, and ENTRYPOINT in exec form so Java gets PID 1 for graceful shutdown."

**"Why not use Spring Security?"**
> "I used a lightweight header-based approach to keep the focus on the DevOps pipeline. But the RBAC logic I wrote — role checks, ownership checks, permission matrix — that exact logic would move into Spring Security's `@PreAuthorize` annotations in production."

---

## 🌐 How Frontend is Served on Port 8080

### Why there's NO separate frontend server:

Spring Boot has an **embedded Tomcat server**. When you add `spring-boot-starter-web` in `pom.xml`, Tomcat is included automatically. You set `server.port=8080` in `application.properties`, and Tomcat listens on that port.

**Spring Boot's built-in rule**: Any file inside `src/main/resources/static/` → automatically served as a web page. No config needed.

### File-to-URL mapping:

| File on Disk | Served At |
|---|---|
| `static/index.html` | `http://localhost:8080/` |
| `static/css/style.css` | `http://localhost:8080/css/style.css` |
| `static/js/api.js` | `http://localhost:8080/js/api.js` |
| `static/js/app.js` | `http://localhost:8080/js/app.js` |

### What happens when user opens localhost:8080:

```
Step 1: Browser requests → localhost:8080
Step 2: Tomcat (embedded in Spring Boot) finds static/index.html → sends it
Step 3: Browser reads HTML → requests CSS & JS files
Step 4: Tomcat serves those too
Step 5: JavaScript calls /api/issues → Spring Boot controller handles it → returns JSON
Step 6: JavaScript renders data on screen dynamically
```

> **Interview line**: "There's no separate frontend server — Spring Boot's embedded Tomcat serves both the static frontend files AND the REST API endpoints from the same server on port 8080."

---

## 🛠️ All Commands Used in This Project

### 📦 Maven Commands (Build & Run)

| Command | What it does |
|---|---|
| `mvn clean compile` | Cleans old build + compiles Java code |
| `mvn test` | Runs all 13 unit tests |
| `mvn clean package -DskipTests` | Builds the JAR file (skips tests) |
| `mvn spring-boot:run` | Starts the app on localhost:8080 |
| `java -jar target/smart-bug-tracker-1.0.0.jar` | Runs the JAR directly without Maven |

### 🐳 Docker Commands

| Command | What it does |
|---|---|
| `docker build -t bugtracker:1.0.0 .` | Builds Docker image from Dockerfile |
| `docker-compose up -d` | Starts all containers (app + Jenkins) in background |
| `docker-compose up -d bugtracker` | Starts only the app container |
| `docker-compose up -d jenkins` | Starts only Jenkins container |
| `docker-compose down` | Stops and removes all containers |
| `docker-compose ps` | Shows running containers |
| `docker-compose logs -f` | Shows live logs |
| `docker images` | Lists all Docker images |
| `docker ps` | Lists running containers |

### 🔧 Dockerfile Instructions

| Command | What it does |
|---|---|
| `FROM eclipse-temurin:17-jre-jammy` | Uses Java 17 JRE as base image (not JDK — smaller & secure) |
| `WORKDIR /app` | Sets working directory inside container |
| `COPY target/...jar app.jar` | Copies built JAR into container |
| `EXPOSE 8080` | Declares port 8080 |
| `HEALTHCHECK` | Pings `/api/health` every 30s to check if app is alive |
| `ENTRYPOINT ["java", "-jar", "app.jar"]` | Runs the app when container starts |

### 🔄 Git Commands

| Command | What it does |
|---|---|
| `git init` | Initializes Git repo |
| `git add -A` | Stages all files |
| `git commit -m "message"` | Commits with message |
| `git push origin main` | Pushes to GitHub |
| `git status` | Shows changed files |
| `git log` | Shows commit history |

### 🗄️ MySQL Commands

| Command | What it does |
|---|---|
| `mysql -u root -p"password"` | Login to MySQL |
| `CREATE DATABASE IF NOT EXISTS bugtracker;` | Creates the database |
| `USE bugtracker;` | Selects the database |
| `SHOW TABLES;` | Lists all tables (users, issues, comments) |
| `SELECT * FROM users;` | Views user data |
| `SELECT * FROM issues;` | Views issue data |

### 🚀 Jenkins Pipeline Stages (from Jenkinsfile)

| Stage | Command Used |
|---|---|
| Checkout | `checkout scm` — pulls code from GitHub |
| Build | `mvn clean compile -q` — compiles Java |
| Test | `mvn test` — runs 13 tests (uses H2, not MySQL) |
| Package | `mvn package -DskipTests -q` — creates JAR |
| Docker Build | `docker build -t bugtracker:1.0.0 .` — builds image |
| Deploy | `docker-compose up -d bugtracker` — starts container |

### 🌐 URLs

| URL | What it is |
|---|---|
| `http://localhost:8080` | App (frontend + REST API) |
| `http://localhost:9090` | Jenkins dashboard |
| `http://localhost:3306` | MySQL server |

---

## 🚫 If You Don't Know Something

> "I haven't explored that yet in this project, but my approach would be..."

This is perfectly fine. Never fake it. Honesty + a logical approach > pretending.
