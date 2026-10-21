# 🎓 CampusConnect — Campus Gig & SkillSwap Portal

> **HacktoberFest 3.0 Submission**  
> **Team:** `team-bhai-issue-hougya`  
> **Issue Reference:** [Issue #12 — Campus Gig & SkillSwap Portal](https://github.com/AWSCloudClubMuet/HacktoberFest-3.0/issues/12)

---

## 🎯 Project Overview

**CampusConnect** is a university marketplace where students can offer their skills, request short-term help, swap skills, or collaborate for free. It enforces role flexibility (students can be posters on one gig and applicants on another), full transactional applicant selection, deadline expiration, and mutual post-completion reputation ratings.

---

## 🚀 Key Features by Milestone

### 🧩 Milestone 1 — Role-Flexible Profiles & Gig Creation
- **Dynamic Dual Roles:** Any student can act as an applicant on one gig and an owner/poster on another.
- **Rich Profiles:** Shows name, university major, semester, bio, skills, dynamic gigs posted, completed, and computed average rating.
- **Validated Posting:** Supports **Offering** vs **Requesting**, 4 categories (**Programming, Design, Writing, Tutoring**), 3 payment models (**Paid in PKR, Skill Swap, Free Collaboration**), positive budget validation for Paid gigs, and client/server validation preventing past deadlines.

### 🧩 Milestone 2 — Discovery & Applications
- **Flagship Marketplace Feed:** Hero section with live platform metrics, keyword search (title and description), category pills, and multi-filter drawer (intent, compensation, status, budget range in PKR).
- **Interactive Applications:** Students can submit personalized pitches with their applications.
- **Automatic Expiration:** Gigs past their deadline automatically display as **Expired** and reject new applications.
- **Constraint Enforcement:** Students cannot apply to their own gigs, nor submit duplicate applications.

### 🧩 Milestone 3 — Applicant Selection & Status Lifecycle
- **Owner Review Panel:** Gig owners can inspect all received applicant proposals, applicant ratings, and skills.
- **Atomic Acceptance (SQLite Transaction):**
  1. Selected applicant is marked **Accepted**.
  2. All other Pending applications for that gig are automatically marked **Rejected**.
  3. Gig status atomically transitions to **In Progress** and assigns `accepted_applicant_id`.
  4. The gig is immediately closed to new applications.
- **Status Lifecycle:** `Open` ➔ `In Progress` ➔ `Completed` (direct `Open` ➔ `Completed` is strictly rejected).

### 🧩 Milestone 4 — Mutual Reviews & Calculated Reputation
- **Two-Way Verification:** Once marked **Completed**, both the gig owner and the accepted applicant can review each other.
- **Enforced Constraints:** Only eligible participants can review, rating is an integer between 1 and 5 stars, exactly one review per participant per gig.
- **Real-Time Reputation:** Average ratings and review counts are computed dynamically using SQL aggregates (`AVG`, `COUNT`), never manually edited.

### 🧩 Milestone 5 — Full REST API & Rich Seed Data
- **Seed Data Included:** 14 realistic university students, 27 diverse gigs spanning all categories and statuses, 22 applications with real messages, and 8 mutual post-completion reviews.
- **Demo Identity Switcher:** Integrated header dropdown allowing judges and testers to switch between any seeded student to test poster, applicant, and review workflows effortlessly.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, React Router v6
- **Backend:** Node.js, Express.js, `better-sqlite3`, CORS
- **Database:** SQLite (WAL mode, foreign keys, transactions, indexes)

---

## 💻 Setup & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Install Dependencies
```bash
# In submission/team-bhai-issue-hougya/
cd submission/team-bhai-issue-hougya

# Backend setup
cd backend && npm install && cd ..

# Frontend setup
cd frontend && npm install && cd ..
```

### 3. Run Both Services Concurrently
From `submission/team-bhai-issue-hougya`:
```bash
npm run dev
```
- **Frontend App:** http://localhost:5173
- **Backend REST API:** http://localhost:5000

### 4. Run Automated Test Suite
To run the automated verification suite validating all 28 API business rules and constraints:
```bash
npm test
```

---

## 👥 Team Information

- **Team Name:** `team-bhai-issue-hougya`
- **Branch:** `team-bhai-issue-hougya`
- **Project Folder:** `/submission/team-bhai-issue-hougya/`
