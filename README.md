# 🏥 Smart Neonatal Incubator Monitoring System

A full-stack medical incubator simulation with real-time data flow, 3D visualization, intelligent alerting, and cybersecurity practices. Built for academic presentation and clinical technology demonstration.

![Architecture](https://img.shields.io/badge/Architecture-Full%20Stack-blue)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)
![3D](https://img.shields.io/badge/3D-Three.js-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## 📋 System Architecture

```
┌─────────────────────┐     HTTP POST      ┌──────────────────────┐
│                     │   (every 2 sec)    │                      │
│  Device Simulator   │ ───────────────►   │   Backend API        │
│  (Node.js)          │   + API Key Auth   │   (NestJS)           │
│                     │                    │                      │
│  Controls:          │                    │  ┌─────────────────┐ │
│  h = High Temp      │                    │  │ REST Endpoints  │ │
│  l = Low Temp       │                    │  │ POST /incubator │ │
│  n = Normal         │                    │  │ GET /latest     │ │
│  q = Quit           │                    │  │ GET /history    │ │
└─────────────────────┘                    │  └────────┬────────┘ │
                                           │           │          │
                                           │  ┌────────▼────────┐ │
                                           │  │  PostgreSQL DB  │ │
                                           │  │ incubator_data  │ │
                                           │  └────────┬────────┘ │
                                           │           │          │
                                           │  ┌────────▼────────┐ │
                                           │  │  WebSocket GW   │ │
                                           │  │  (Socket.IO)    │ │
                                           │  └────────┬────────┘ │
                                           └───────────┼──────────┘
                                                       │
                                              WebSocket Push
                                                       │
                                           ┌───────────▼──────────┐
                                           │   Frontend Dashboard │
                                           │   (Next.js)          │
                                           │                      │
                                           │  ┌────────┐ ┌──────┐ │
                                           │  │3D Model│ │Charts│ │
                                           │  │(R3F)   │ │      │ │
                                           │  └────────┘ └──────┘ │
                                           │  ┌────────┐ ┌──────┐ │
                                           │  │Alerts  │ │Remote│ │
                                           │  │Panel   │ │Ctrl  │ │
                                           │  └────────┘ └──────┘ │
                                           └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js (App Router), React |
| Charts | Recharts |
| 3D Model | Three.js, React Three Fiber, @react-three/drei |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL |
| Real-time | Socket.IO (WebSocket) |
| Simulator | Node.js (vanilla) |
| Security | API Key Auth, Input Validation, Rate Limiting |

---

## 🚀 Setup Steps

### Prerequisites
- Node.js v18+ installed
- PostgreSQL server accessible

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DB_HOST=51.255.93.92
DB_PORT=5432
DB_USERNAME=incubator_user
DB_PASSWORD=test123
DB_DATABASE=incubator
API_KEY=incubator-secure-key-2024
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
# Terminal 1 - Backend API
cd backend
npm run start:dev

# Terminal 2 - Frontend Dashboard
cd frontend
npm run dev

# Terminal 3 - Device Simulator
cd simulator
node index.js
```

### 4. Open Dashboard

Navigate to **http://localhost:3000** in your browser.

---

## 📊 Data Flow

```
Simulator → HTTP POST → Backend API → PostgreSQL → WebSocket → Frontend Dashboard
                         (validates)   (stores)     (pushes)    (displays)
```

1. **Simulator** generates temperature & humidity readings every 2 seconds
2. **Backend** validates data ranges, stores in PostgreSQL, broadcasts via WebSocket
3. **Frontend** receives real-time updates, renders charts, 3D model, and alerts

---

## 🔐 Security Implementation

| Feature | Description |
|---------|-------------|
| **API Key Authentication** | All write endpoints require `x-api-key` header |
| **Input Validation** | `class-validator` enforces: temperature 35.0–39.5°C, humidity 40–80% |
| **Rate Limiting** | `@nestjs/throttler` limits 100 requests/minute per IP |
| **CORS** | Restricted to frontend origin (`localhost:3000`) |
| **Unauthorized Access** | Returns `401 Unauthorized` for missing/invalid API keys |
| **HTTPS** | In production: deploy behind nginx reverse proxy with TLS/SSL certificates |

---

## 🎮 Demo Scenario

1. **Start all 3 components** (backend → frontend → simulator)
2. **Dashboard updates** in real-time with normal readings (green status)
3. **Press `h`** in simulator → temperature spikes → **red alert** appears, 3D model glows red
4. **Press `l`** in simulator → temperature drops → **yellow/red warning**
5. **Press `n`** to return to normal
6. **Adjust remote control** sliders to set target temperature

---

## 📁 Project Structure

```
Incubator/
├── backend/              # NestJS API Server
│   ├── src/
│   │   ├── incubator/    # Core module (entity, service, controller, gateway)
│   │   ├── auth/         # API key authentication guard
│   │   ├── app.module.ts # Root module with TypeORM & PostgreSQL config
│   │   └── main.ts       # Entry point with CORS & validation
│   └── .env              # Database & API credentials
├── frontend/             # Next.js Dashboard
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components (3D model, charts, alerts)
│   │   └── hooks/        # useIncubatorData (WebSocket + polling)
│   ├── public/models/    # 3D FBX model & PBR textures
│   └── .env.local        # API endpoints config
├── simulator/            # Device Simulator
│   ├── index.js          # Main simulator script
│   └── .env              # Backend URL & API key
└── README.md             # This file
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/incubator` | API Key | Submit a reading |
| `GET` | `/api/incubator/latest` | None | Get latest reading |
| `GET` | `/api/incubator/history?limit=100` | None | Get historical readings |
| `GET` | `/api/incubator/settings` | None | Get target settings |
| `PATCH` | `/api/incubator/settings` | API Key | Update target settings |

---

## 🚨 Alert Thresholds

| Condition | Status | Color |
|-----------|--------|-------|
| 36.0°C ≤ temp ≤ 38.0°C | ✅ Normal | Green |
| 35.5°C ≤ temp < 36.0°C or 38.0°C < temp ≤ 38.5°C | ⚠️ Warning | Yellow |
| temp < 35.5°C or temp > 38.5°C | 🚨 Critical | Red |
