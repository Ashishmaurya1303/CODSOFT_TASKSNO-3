# 🚛 FleetFlow — Logistics & Fleet Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=flat&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

A modern, enterprise-grade full-stack logistics and fleet management web application developed for **CodSoft Full Stack Web Development Internship (Task 5)**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features & Architecture](#-key-features--architecture)
4. [Prerequisites](#-prerequisites)
5. [Local Development Setup](#-local-development-setup)
6. [Pre-configured Test Accounts](#-pre-configured-test-accounts)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Vercel & Cloud PostgreSQL Deployment Guide](#-vercel--cloud-postgresql-deployment-guide)
9. [Internship Demonstration Video Checklist](#-internship-demonstration-video-checklist)

---

## 🌟 Project Overview

**FleetFlow** centralizes logistics operations for commercial transport carriers, distribution centers, and freight forwarders:
- **Central Dashboard:** Live metrics for total shipments, dispatches in transit, success rates, driver availability, and fleet payloads.
- **Shipment Management:** Full CRUD operations with auto-generated unique Tracking IDs (`FF-XXXXX-IN`), status transitions, and audited timeline logs.
- **Driver Dispatch:** License verification, rating profiles, conflict prevention, and active delivery tracking.
- **Fleet Vehicles:** Tracking payload capacities, fuel types, maintenance schedules, and assigned routes.
- **Warehouses & Corridors:** Interactive vector freight map connecting major Indian logistics hubs.
- **Real-Time Updates:** Server-Sent Events (SSE / WebSockets) streaming instantaneous status changes to open dashboard sessions.
- **Driver Mobile Terminal:** Segregated portal allowing drivers to view assigned dispatches and submit status updates.
- **Public Customer Tracker:** Live tracking portal accessible without login.
- **Analytics & Export:** Operational reports with 1-click CSV download.

---

## 🛠 Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) + React | Pure JavaScript (`.jsx` / `.js`) |
| **Styling** | Tailwind CSS v4 | Enterprise theme with dark/light visual design |
| **Backend** | Next.js Route Handlers | REST-style JSON API endpoints |
| **Database** | PostgreSQL (Production) / SQLite (Local) | Dual-ready relational models |
| **ORM** | Prisma ORM | Parameterized queries, schema migrations, client generator |
| **Auth & Security** | JWT + bcryptjs | HTTP-only cookies, password hashing, RBAC |
| **Real-time** | Server-Sent Events (SSE) | Real-time live status updates across tabs |
| **Icons** | Lucide React | Modern feather-style vector icons |

---

## 🔑 Pre-configured Test Accounts

For demonstration and testing, the database seed script provides ready accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Fleet Admin** | `admin@fleetflow.com` | `Admin@123` | Full Administrative & Dispatch Control |
| **Driver 1** | `rajesh.driver@fleetflow.com` | `Driver@123` | Assigned to Shipment `FF-89210-IN` |
| **Driver 2** | `amit.driver@fleetflow.com` | `Driver@123` | Assigned to Urgent Cargo `FF-74125-IN` |

> 💡 **Quick 1-Click Fill:** The login page (`/login`) includes buttons to automatically populate these credentials with one click!

---

## 🚀 Local Development Setup

Follow these exact steps in Windows PowerShell or Terminal:

### 1. Clone & Enter Directory
```powershell
cd "e:\code soft\fleetflow"
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Initialize & Seed Database
FleetFlow includes dual database compatibility:
- **Instant Offline Local Development (Default):**
  ```powershell
  npm run db:push
  npm run seed
  ```
- **With Cloud / Local PostgreSQL:**
  Set your `DATABASE_URL` in `.env` and run:
  ```powershell
  npm run db:push:postgres
  npm run seed
  ```

### 4. Start Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📱 Application Routes Walkthrough

- **`http://localhost:3000/`** — Landing page with hero tracking search.
- **`http://localhost:3000/login`** — Sign in with 1-click demo buttons.
- **`http://localhost:3000/dashboard`** — Operational KPI cards, live chart, recent dispatches.
- **`http://localhost:3000/shipments`** — Full CRUD management (Create, search, filter, edit, delete).
- **`http://localhost:3000/shipments/[id]`** — Detailed consignment inspection with live status dispatcher.
- **`http://localhost:3000/drivers`** — Driver management, commercial licenses, ratings.
- **`http://localhost:3000/vehicles`** — Fleet capacity tracking and maintenance statuses.
- **`http://localhost:3000/warehouses`** — Interactive route network map and hub capacities.
- **`http://localhost:3000/reports`** — Delivery performance statistics and CSV Export.
- **`http://localhost:3000/track`** — Public customer tracking portal.
- **`http://localhost:3000/track/FF-89210-IN`** — Sample live tracking timeline.
- **`http://localhost:3000/driver/dashboard`** — Mobile-first driver dispatch console.

---

## 🌐 Vercel & Cloud PostgreSQL Deployment Guide

Deploying FleetFlow to the cloud takes approximately 3 minutes:

### Step 1: Create a Free Hosted PostgreSQL Database (Neon.tech)
1. Go to **[https://neon.tech](https://neon.tech)** and sign up for a free account.
2. Create a new project named `fleetflow`.
3. Copy the pooled PostgreSQL connection string:
   ```text
   postgresql://alex:AbCdEf123@ep-cool-fog-123456.us-east-2.aws.neon.tech/fleetflow?sslmode=require
   ```

### Step 2: Push Database Schema to Neon
In your local terminal:
1. Update `.env`:
   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   ```
2. Push schema and seed sample data:
   ```powershell
   npm run db:push:postgres
   npm run seed
   ```

### Step 3: Deploy to Vercel
1. Push your code to your GitHub repository:
   ```powershell
   git add .
   git commit -m "Complete FleetFlow platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fleetflow.git
   git push -u origin main
   ```
2. Log into **[https://vercel.com](https://vercel.com)** and click **"Add New Project"**.
3. Import your `fleetflow` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: Any random 32-character secret string.
5. Click **"Deploy"**!

---

## 📹 Internship Demonstration Video Checklist

When recording your submission video for CodSoft Task 5, follow this checklist:

1. **Introduction (30s):** Introduce yourself, state "CodSoft Full Stack Web Development Internship — Task 5: FleetFlow Logistics Platform", and mention the tech stack (Next.js, JavaScript, Tailwind CSS, Prisma, PostgreSQL).
2. **Landing Page & Public Tracking (45s):**
   - Show the homepage at `/`.
   - Enter tracking ID `FF-89210-IN` into the public tracker.
   - Showcase the milestone stages and checkpoint history.
3. **Admin Dashboard (60s):**
   - Log in using `admin@fleetflow.com`.
   - Walk through the live KPI cards, shipment status breakdown chart, and driver availability metrics.
4. **Shipment CRUD Operations (60s):**
   - Click "Create New Shipment".
   - Fill in sender, recipient, assign a driver and vehicle.
   - Show the newly created shipment appearing with its unique Tracking ID.
   - Edit the shipment and show how status transitions update the audit trail.
5. **Drivers & Fleet Management (45s):**
   - Show the drivers page with commercial licenses and active trip counters.
   - Show the fleet vehicles page with payload capacity in tonnes and maintenance toggles.
6. **Warehouses & Route Corridors (45s):**
   - Open `/warehouses` and interact with the vector route map connecting Mumbai, Delhi, Bengaluru, and Ahmedabad.
7. **Driver Terminal (45s):**
   - Log out and log in as `rajesh.driver@fleetflow.com`.
   - Demonstrate the driver's view and update a delivery to "Out for Delivery" or "Delivered".
8. **Reports & Export (30s):**
   - Switch to `/reports`, show the driver leaderboard, and click "Export CSV Report".
9. **Conclusion (15s):** Thank CodSoft and show the GitHub repository.

---

*Built with ❤️ for CodSoft Full Stack Internship 2026.*
