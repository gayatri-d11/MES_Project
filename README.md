# Brose Plant Digitalization Platform

A web-based platform developed for Brose to digitalize shift-level production operations.
It replaces manual shift logs with a structured system for recording downtime, production counts,
and resource data — and provides supervisors with real-time visibility into plant performance.

---

## Overview

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Ant Design          |
| Backend  | Django 4.2, Django REST Framework   |
| Database | PostgreSQL 14+                      |
| Auth     | JWT (SimpleJWT)                     |

---

## Modules

| Module               | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Master Data          | Manage plants, work centers, workstations, machines, shifts, reason codes, and products |
| Manual Transaction   | Record shift-level downtime, cycle times, resource allocation, and production counts (OK/NOK) |
| Production Dashboard | Visualize KPIs, downtime patterns, and quality metrics across shifts and variants |
| Settings             | Manage employees, roles, and page-level access permissions                  |

---

## Project Structure

```
/
├── brose_backend/          # Django REST API
│   ├── core/               # Models, views, serializers, URLs
│   ├── brose_backend/      # Django project settings
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
│
├── brose-platform/         # React frontend
│   ├── src/
│   │   ├── page/           # Page components (Dashboard, MasterData, Transaction, etc.)
│   │   ├── layout/         # AppLayout, Header, Sidebar
│   │   ├── context/        # AuthContext (JWT + auto logout)
│   │   ├── routes/         # AppRoutes, ProtectedRoute
│   │   ├── theme/          # Ant Design theme, colors, constants
│   │   └── utils/          # apiFetch utility
│   └── package.json
│
├── SETUP.md                # Full setup guide for new machines
└── README.md               # This file
```

---

## Quick Start

For full setup instructions, refer to **[SETUP.md](./SETUP.md)**.

```bash
# 1. Create database in pgAdmin
CREATE DATABASE brose_db;

# 2. Backend
cd brose_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_project

# 3. Frontend
cd brose-platform
npm install
npm run dev
```

Backend: `http://localhost:8000`
Frontend: `http://localhost:5173`

Default admin login — Employee No: `BR-00000001` / Password: `Admin@123`

---

## Environment Configuration

The `.env` file is not committed to the repository.
Copy `.env.example` to `.env` and fill in your values:

```bash
cp brose_backend/.env.example brose_backend/.env
```

---

## Development Notes

- The `setup_project` management command seeds all base data and is safe to run multiple times
- All API endpoints are prefixed with `/api/`
- JWT access token lifetime is 8 hours; auto logout is handled on the frontend on token expiry
- Page-level access is controlled via roles assigned to employees in Settings

---

## Repository

Maintained by the Brose digitalization development team.
For setup issues, refer to `SETUP.md`. For code-level questions, refer to inline code documentation.
