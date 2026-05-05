# 🏥 Hospital Information System — Smart Medical Device Monitoring

A comprehensive, full-stack **Hospital Information System (HIS)** with real-time IoT device monitoring, 3D visualization, role-based authentication, patient and staff management, billing, reports, and biomedical engineering analytics. Built as an academic capstone project demonstrating clinical technology integration.

![Architecture](https://img.shields.io/badge/Architecture-Full%20Stack-blue)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![3D](https://img.shields.io/badge/3D-Three.js%20%2F%20R3F-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Auth](https://img.shields.io/badge/Auth-JWT-orange)
![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark-purple)

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Authentication & Roles](#-authentication--roles)
- [Dashboard Views](#-dashboard-views)
- [Device Pages](#-device-pages--3d-visualization)
- [Biomedical Engineering KPIs](#-biomedical-engineering-kpis)
- [Theme System](#-theme-system-light--dark-mode)
- [API Endpoints](#-api-endpoints)
- [Data Flow](#-data-flow)
- [Security](#-security-implementation)
- [Alert Thresholds](#-alert-thresholds)
- [Demo Scenario](#-demo-scenario)

---

## 🌐 System Overview

This system simulates a hospital environment where multiple IoT-enabled medical devices (incubators, ventilators, ECG monitors, SpO₂ monitors, infusion pumps, and patient monitors) are tracked in real-time through a central administrative dashboard. The platform includes:

- **Real-time device monitoring** with WebSocket-based live data streaming
- **Interactive 3D model visualization** of medical equipment using React Three Fiber
- **Administrative HIS dashboard** with 8 management views
- **Role-based authentication** (Admin, Doctor, Nurse, Technician)
- **Patient & staff CRUD management** with modal forms
- **Billing & reporting modules** with CSV export capability
- **Biomedical engineering analytics** (IPM, Availability, MTBF, Failure Rate, Reliability)
- **Persistent light/dark theme toggle** across all views

---

## ✨ Features

### Administrative Dashboard
| View | Description |
|------|-------------|
| **Overview** | KPI summary cards, temperature/humidity trends, device status donut chart, biomedical engineering indicators, alerts feed, active device sessions |
| **Equipment** | Inventory grid of all 6 registered devices with status, location, serial numbers, and quick-launch to device dashboards |
| **Maintenance** | Maintenance log table with task status tracking (completed, pending, overdue) and summary statistics |
| **Schedule** | Doctor schedule & appointment management with daily/weekly/monthly views |
| **Patients** | Patient records table with search, status badges, and Add Patient modal (name, age, gender, blood type, room, doctor, diagnosis) |
| **Reports** | Reporting module with CSV export for patient data and equipment metrics |
| **Billing** | Billing management with invoice tracking, payment status, and CSV export |
| **Staff** | Staff directory with role filtering, and Add User modal that registers users in the backend via `/auth/register` |

### Device Dashboards
| Device | Status | 3D Model | Real-time Data |
|--------|--------|----------|----------------|
| Smart Incubator | ✅ Online | `incubator.glb` (27 MB) | Temperature & humidity via WebSocket |
| Ventilator | ✅ Online | `ventilator.glb` (5.4 MB) | Mode, respiratory rate |
| ECG Monitor | ✅ Online | `ecg.glb` (4.9 MB) | Heart rate, QT interval |
| SpO₂ Monitor | ✅ Online | `spo2.glb` (5.4 MB) | SpO₂ percentage, pulse rate |
| Patient Monitor | ⬚ Offline | — | Coming Soon |
| Infusion Pump | ⬚ Offline | — | Coming Soon |

### Additional Features
- 🌗 **Light / Dark mode** with `localStorage` persistence and smooth CSS transitions
- 🔐 **JWT-based authentication** with bcrypt password hashing
- 📊 **Live Recharts** with glow effects, reference ranges, trend indicators, and stat rows
- 🎮 **Remote Control** — adjust incubator target temperature and humidity from the dashboard
- 🏗️ **GSAP-powered 3D showcase** — scroll-triggered camera choreography with pinned info cards
- 📱 **Responsive design** — works across screen sizes

---

## 📐 System Architecture

```
┌─────────────────────┐     HTTP POST      ┌─────────────────────────────┐
│                     │   (every 2 sec)    │                             │
│  Device Simulator   │ ───────────────►   │   Backend API (NestJS)      │
│  (Node.js)          │   + API Key Auth   │                             │
│                     │                    │  ┌─────────────────┐        │
│  Controls:          │                    │  │ REST Endpoints  │        │
│  h = High Temp      │                    │  │ POST /incubator │        │
│  l = Low Temp       │                    │  │ GET /latest     │        │
│  n = Normal         │                    │  │ GET /history    │        │
│  q = Quit           │                    │  └────────┬────────┘        │
└─────────────────────┘                    │           │                 │
                                           │  ┌────────▼────────┐       │
                                           │  │  PostgreSQL DB  │       │
                                           │  │  + TypeORM      │       │
                                           │  └────────┬────────┘       │
                                           │           │                │
                                           │  ┌────────▼────────┐       │
                                           │  │  Auth Module     │       │
                                           │  │  JWT + bcrypt    │       │
                                           │  └────────┬────────┘       │
                                           │           │                │
                                           │  ┌────────▼────────┐       │
                                           │  │  WebSocket GW   │       │
                                           │  │  (Socket.IO)    │       │
                                           │  └────────┬────────┘       │
                                           └───────────┼────────────────┘
                                                       │
                                              WebSocket Push
                                                       │
                                           ┌───────────▼────────────────┐
                                           │   Frontend (Next.js 15)    │
                                           │                            │
                                           │  ┌──────────────────────┐  │
                                           │  │  Login Page (JWT)    │  │
                                           │  └──────────┬───────────┘  │
                                           │             │              │
                                           │  ┌──────────▼───────────┐  │
                                           │  │  HIS Admin Dashboard │  │
                                           │  │  8 Views + Theme     │  │
                                           │  └──────────┬───────────┘  │
                                           │             │              │
                                           │  ┌──────────▼───────────┐  │
                                           │  │  Device Pages        │  │
                                           │  │  3D + Charts + Ctrl  │  │
                                           │  └──────────────────────┘  │
                                           └────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router), React 19 | SSR, routing, UI framework |
| **Styling** | Vanilla CSS with CSS Variables | 80+ design tokens, light/dark theming |
| **Charts** | Recharts | Area charts with gradients, glow, and stat rows |
| **3D Engine** | Three.js, React Three Fiber, @react-three/drei | GLB model rendering, orbit controls, contact shadows |
| **3D Animations** | GSAP + ScrollTrigger | Scroll-scrubbed camera choreography |
| **Icons** | Lucide React | Consistent medical-themed iconography |
| **Backend** | NestJS, TypeORM | REST API, WebSocket gateway, ORM |
| **Database** | PostgreSQL | Persistent storage for readings, users |
| **Auth** | JWT, bcrypt, Passport.js | Token-based auth with role guards |
| **Real-time** | Socket.IO | Bidirectional WebSocket push |
| **Simulator** | Node.js (vanilla) | Device data generation with keyboard controls |

---

## 📁 Project Structure

```
Incubator/
├── README.md
│
├── backend/                         # NestJS API Server
│   ├── src/
│   │   ├── app.module.ts            # Root module — TypeORM, PostgreSQL, CORS
│   │   ├── main.ts                  # Bootstrap — validation pipes, CORS config
│   │   │
│   │   ├── auth/                    # Authentication Module
│   │   │   ├── auth.module.ts       # Module registration
│   │   │   ├── auth.controller.ts   # POST /auth/login, POST /auth/register
│   │   │   ├── auth.service.ts      # bcrypt hashing, JWT signing
│   │   │   ├── auth.guard.ts        # API key guard for device endpoints
│   │   │   ├── jwt.strategy.ts      # Passport JWT strategy
│   │   │   ├── jwt-auth.guard.ts    # JWT bearer token guard
│   │   │   ├── roles.guard.ts       # Role-based access control
│   │   │   ├── roles.decorator.ts   # @Roles() decorator
│   │   │   ├── user.entity.ts       # User entity (email, password, role, fullName)
│   │   │   └── dto/                 # Login & Register DTOs
│   │   │
│   │   └── incubator/               # IoT Device Module
│   │       ├── incubator.module.ts
│   │       ├── incubator.controller.ts  # REST: POST data, GET latest/history/settings
│   │       ├── incubator.service.ts     # Business logic, data validation
│   │       ├── incubator.gateway.ts     # Socket.IO WebSocket gateway
│   │       ├── incubator.entity.ts      # TypeORM entity (temperature, humidity, timestamp)
│   │       └── dto/                     # Create reading DTO with class-validator
│   │
│   └── .env                         # DB credentials, JWT secret, API key
│
├── frontend/                        # Next.js 15 Dashboard
│   ├── public/
│   │   ├── incubator.glb            # 3D incubator model (27 MB)
│   │   ├── ventilator.glb           # 3D ventilator model
│   │   ├── ecg.glb                  # 3D ECG monitor model
│   │   └── spo2.glb                 # 3D SpO₂ monitor model
│   │
│   └── src/
│       ├── app/
│       │   ├── layout.js            # Root layout with AuthProvider
│       │   ├── providers.js         # React context providers
│       │   ├── globals.css          # 3,300+ lines — full design system with CSS variables
│       │   ├── page.js              # Main HIS dashboard (1,200+ lines)
│       │   │                        #   └── OverviewView, EquipmentView, MaintenanceView,
│       │   │                        #       ScheduleView, PatientsView, ReportsView,
│       │   │                        #       BillingView, StaffView, HomePage
│       │   ├── login/page.js        # JWT login page with theme toggle
│       │   └── devices/
│       │       ├── incubator/page.js  # Incubator device dashboard
│       │       ├── ventilator/page.js # Ventilator device dashboard
│       │       ├── ecg/page.js        # ECG device dashboard
│       │       └── spo2/page.js       # SpO₂ device dashboard
│       │
│       ├── components/
│       │   ├── GenericDeviceDashboard.jsx  # Reusable device page (3D + metrics + charts)
│       │   ├── GenericDeviceShowcase.jsx   # GSAP scroll-triggered 3D showcase
│       │   ├── Charts.jsx                 # TemperatureChart, HumidityChart, DeviceChart
│       │   ├── AlertPanel.jsx             # Alert notifications panel
│       │   └── RemoteControl.jsx          # Target temp/humidity sliders
│       │
│       ├── contexts/
│       │   └── AuthContext.js             # JWT auth context (login, logout, token, user)
│       │
│       └── hooks/
│           └── useIncubatorData.js        # WebSocket + REST polling hook
│
├── simulator/                       # Device Simulator
│   ├── index.js                     # Generates readings, keyboard controls (h/l/n/q)
│   ├── package.json
│   └── .env                         # Backend URL & API key
│
└── incubator_model/                 # Raw 3D model source files
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** server accessible
- **npm** or **yarn**

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Simulator
cd ../simulator
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=incubator_user
DB_PASSWORD=your_password
DB_DATABASE=incubator
API_KEY=incubator-secure-key-2024
JWT_SECRET=your-jwt-secret-key
PORT=3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=incubator-secure-key-2024
```

**Simulator** (`simulator/.env`):
```env
BACKEND_URL=http://localhost:3001
API_KEY=incubator-secure-key-2024
INTERVAL_MS=2000
```

### 3. Start the System

Open **3 terminals** and run:

```bash
# Terminal 1 — Backend API
cd backend
npm run start:dev

# Terminal 2 — Frontend Dashboard
cd frontend
npm run dev

# Terminal 3 — Device Simulator
cd simulator
node index.js
```

### 4. Access the Application

| URL | Page |
|-----|------|
| `http://localhost:3000` | Login Page |
| `http://localhost:3000/devices/incubator` | Incubator Dashboard (after login) |
| `http://localhost:3001` | Backend API |

**Default Admin Credentials:**
```
Email:    admin@hospital.com
Password: admin123
```

---

## 🔐 Authentication & Roles

The system uses **JWT-based authentication** with **bcrypt** password hashing.

| Role | Permissions |
|------|------------|
| **Admin** | Full access — manage users, patients, devices, view all dashboards |
| **Doctor** | View patient records, device dashboards, schedule appointments |
| **Nurse** | View patient records, monitor devices, adjust settings |
| **Technician** | Equipment maintenance, device calibration, remote control access |

### Auth Flow
1. User enters credentials on the **Login Page** (`/login`)
2. Frontend sends `POST /auth/login` with email + password
3. Backend validates with bcrypt, returns a **JWT token**
4. Token is stored in `AuthContext` and sent as `Authorization: Bearer <token>` on subsequent requests
5. Staff registration uses `POST /auth/register` (admin-only)

---

## 📊 Dashboard Views

### Overview
- **4 KPI Cards** — Total Devices (6), Online (4), Active Alerts (3), Uptime (99.2%)
- **Sparkline Charts** — Temperature trend (+0.3°C) and humidity trend (-2%)
- **Device Status Donut** — 4/6 online ratio visualization
- **Device Indicators** — Quick-status list for all 6 devices with location & online/offline badges
- **Biomedical Engineering KPIs** — IPM Rate, Availability, Failure Rate, MTBF, Reliability R(t)
- **Recent Alerts** — Feed of critical, warning, and info alerts from all devices
- **Active Sessions** — Table showing which user is on which device, for how long

### Equipment
- Grid of 6 device cards with status badges, serial numbers, locations, and live stat previews
- Online devices link to their dedicated real-time dashboards
- Offline devices show "Coming Soon"

### Maintenance
- Summary cards: Total Tasks, Completed, Pending, Overdue
- Full maintenance log table with task descriptions, dates, and status badges

### Schedule
- Doctor appointment scheduling with calendar views (daily/weekly/monthly)
- Follow-up appointment booking

### Patients
- Searchable patient records table (by name, ID, or doctor)
- **Add Patient** modal: name, age, gender, blood type, room, doctor, diagnosis
- Status badges: Admitted (green), Critical (red), Discharged (blue)

### Reports
- Equipment performance reports
- Patient data reports
- **CSV export** functionality

### Billing
- Invoice tracking with payment status
- Billing summaries with totals
- **CSV export** for financial records

### Staff
- Staff directory with role-based filtering
- **Add User** modal with backend registration (email, password, role, department)
- Role badges color-coded by type

---

## 🏗️ Device Pages & 3D Visualization

Each online device has a dedicated dashboard page (`/devices/{device}`) with:

### Split Layout
- **Left panel** — Interactive 3D model (GLB) rendered with React Three Fiber, auto-fit scaling, slow rotation, orbit controls, status-based emissive glow (green → yellow → red)
- **Right panel** — Live metric cards, Recharts area charts with glow effects, alert panel, and remote control sliders

### 3D Showcase
Scrolling past the dashboard triggers a **GSAP ScrollTrigger showcase**:
- Camera smoothly orbits around the 3D model
- Pinned info cards appear with specs (accuracy, response time, protocols, safety standards)
- Finale section with team branding

### Theme-Aware Canvas
The 3D canvas background dynamically switches between `#111111` (dark) and `#f0f2f5` (light) using a `MutationObserver` on the `data-theme` attribute.

---

## 📈 Biomedical Engineering KPIs

The Overview dashboard includes 5 clinical engineering indicators with circular gauge visualizations:

| Indicator | Value | Formula | Target |
|-----------|-------|---------|--------|
| **IPM Completion Rate** | 92% | Completed PM tasks / Total scheduled | ≥ 90% |
| **Equipment Availability** | 97.3% | Uptime / (Uptime + Downtime) | ≥ 95% |
| **Failure Rate (λ)** | 0.012/hr | Number of failures / Total operating hours | ≤ 0.02 |
| **MTBF** | 1,217 hrs | Total uptime / Number of failures | ≥ 1,000 hrs |
| **Reliability R(t)** | 88.6% | R(t) = e^(−λt), t = 720 hrs (30 days) | ≥ 85% |

---

## 🌗 Theme System (Light / Dark Mode)

The entire application supports a **persistent light/dark mode toggle**:

- **Toggle Location** — Sun/Moon icon in the dashboard topbar and login page (top-right)
- **Persistence** — User preference saved in `localStorage` as `his_theme`
- **Architecture** — 80+ CSS custom properties in `:root` with `[data-theme="light"]` override block
- **Scope** — All views: login page, all 8 dashboard views, device pages, 3D canvases, charts, modals
- **Transitions** — Smooth 0.3s ease on backgrounds, borders, and shadows via `var(--theme-transition)`

### Color Palette Summary

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#0e0e12` | `#f0f2f5` |
| Sidebar | `#111114` | `#ffffff` |
| Cards | `#222222` | `#ffffff` |
| Text | `#e0e0e0` | `#1a1a2e` |
| Borders | `#1e1e24` | `#e0e2e6` |
| Accent | `#42a5f5` | `#1976d2` |

---

## 🔌 API Endpoints

### Device Data

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/incubator` | API Key | Submit a temperature/humidity reading |
| `GET` | `/api/incubator/latest` | None | Get the most recent reading |
| `GET` | `/api/incubator/history?limit=100` | None | Get historical readings |
| `GET` | `/api/incubator/settings` | None | Get target temperature/humidity settings |
| `PATCH` | `/api/incubator/settings` | API Key | Update target settings |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | None | Login with email/password, returns JWT |
| `POST` | `/auth/register` | JWT (Admin) | Register a new user with role assignment |

---

## 📊 Data Flow

```
Simulator ──► HTTP POST ──► Backend API ──► PostgreSQL ──► WebSocket ──► Frontend Dashboard
                              (validates)    (stores)       (pushes)      (renders live)
```

1. **Simulator** generates temperature & humidity readings every 2 seconds with configurable modes
2. **Backend** validates data ranges via `class-validator`, persists to PostgreSQL, broadcasts via Socket.IO
3. **Frontend** receives real-time updates through `useIncubatorData` hook, renders Recharts + 3D model
4. **Alerts** auto-generate when readings exceed safe thresholds — visual, badge, and panel notifications

---

## 🔐 Security Implementation

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Stateless token-based auth with configurable expiry |
| **bcrypt Password Hashing** | Salted hashing for all user passwords |
| **API Key Authentication** | Device-to-server writes require `x-api-key` header |
| **Role-Based Access Control** | `@Roles()` decorator + `RolesGuard` restrict endpoints by user role |
| **Input Validation** | `class-validator` enforces: temperature 35.0–39.5°C, humidity 40–80% |
| **Rate Limiting** | `@nestjs/throttler` limits 100 requests/minute per IP |
| **CORS** | Restricted to frontend origin (`localhost:3000`) |

---

## 🚨 Alert Thresholds

| Condition | Status | Color |
|-----------|--------|-------|
| 36.0°C ≤ temp ≤ 38.0°C | ✅ Normal | Green |
| 35.5°C ≤ temp < 36.0°C **or** 38.0°C < temp ≤ 38.5°C | ⚠️ Warning | Yellow |
| temp < 35.5°C **or** temp > 38.5°C | 🚨 Critical | Red |

When status changes:
- **3D model** emissive color shifts (green → amber → red glow)
- **Dashboard header** status badge updates
- **Alert panel** logs the event with timestamp and severity
- **Point light** in 3D scene intensifies for critical states

---

## 🎮 Demo Scenario

1. **Start all 3 components** — backend → frontend → simulator
2. **Login** at `http://localhost:3000` with `admin@hospital.com` / `admin123`
3. **Explore the HIS Dashboard** — toggle between all 8 views (Overview, Equipment, Maintenance, etc.)
4. **Click Equipment → Smart Incubator** to open the real-time device dashboard
5. **Watch live data** — temperature and humidity charts update in real-time
6. **Press `h`** in the simulator terminal → temperature spikes → red critical alert, 3D model glows red
7. **Press `n`** → return to normal → green status restored
8. **Toggle theme** — click the Sun/Moon icon in the topbar to switch between light and dark mode
9. **Add a patient** — go to Patients → Add Patient → fill in details
10. **Add a user** — go to Staff → Add User → register a new doctor/nurse with password
11. **Export data** — go to Reports or Billing → click CSV export

---

## 👥 Team

**Team #6** — Biomedical Engineering Department

---

## 📄 License

This project is developed for academic purposes as part of a clinical engineering capstone course.
