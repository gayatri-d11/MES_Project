# Brose Platform — New Machine Setup Guide

Follow these steps in order on any new machine.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ with pgAdmin (must be installed and running)

---

## 1. Database Setup

Open pgAdmin and create the database:

```sql
CREATE DATABASE brose_db;
```

Make sure your PostgreSQL user is `postgres` with password `postgres` on port `5432`.
If different, update the `.env` file in `MES_Backend/` accordingly.

> pgAdmin is also useful for inspecting tables, running queries, and debugging data issues during development.

---

## 2. Environment Files

**Backend:**

```bash
cd MES_Backend
copy .env.example .env
```

Open `.env` and set your values:

```
DB_NAME=brose_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=any-long-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend:**

```bash
cd MES_Frontend
copy .env.example .env
```

The default value `VITE_API_BASE_URL=http://localhost:8000/api` is correct for local dev — no changes needed.

---

## 3. Backend Setup

```bash
cd MES_Backend

# Install dependencies
pip install -r requirements.txt

# Run migrations (creates all tables)
python manage.py migrate
```

---

## 4. Seed Data

After migrations, run this single command to populate all base data and create the admin user:

```bash
python manage.py setup_project
```

This creates:
- Admin user, role, and all page permissions
- Sample plant (`Plant-A`), work centers, workstations, machines
- All 14 standard Brose reason types
- Reason codes (including `NOK-SC`, `NOK-RW`, `NOK-RT`), shifts, shift planning, products

Default admin login:
- Employee No: `BR-00000001`
- Password: `Admin@123`

> `setup_project` is safe to run multiple times (idempotent).

---

## 5. Start Backend

```bash
cd MES_Backend
python manage.py runserver
```

Backend runs at: http://localhost:8000

---

## 6. Frontend Setup

```bash
cd MES_Frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Summary Checklist

- [ ] PostgreSQL and pgAdmin installed and running
- [ ] `brose_db` database created via pgAdmin
- [ ] `MES_Backend/.env` file created (copied from `.env.example`)
- [ ] `MES_Frontend/.env` file created (copied from `.env.example`)
- [ ] `pip install -r requirements.txt` done inside `MES_Backend/`
- [ ] `python manage.py migrate` done
- [ ] `python manage.py setup_project` done
- [ ] `npm install` done inside `MES_Frontend/`
- [ ] Both servers running (port 8000 and 5173)
- [ ] Default admin password changed via Settings → My Profile after first login

---

## Platform Usage Notes

- **Downtime duration** is entered and stored in **seconds**
- **Shift duration** is defined as a time range (e.g. `8:00 AM - 4:00 PM`) in Master Data → Shift Definition
- After saving any transaction section, click **CALCULATE** to compute KPIs
- KPI values (OEE, EA, PE, QR) are raw ratios (e.g. `0.85` = 85%)
- NOK Type and NOK Reason Code are bidirectionally linked — selecting one auto-sets the other
- Page-level access is controlled via Roles in Settings

---

## Production Deployment

### 1. Backend `.env` — production values

```
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=<your-server-ip-or-domain>
CORS_ALLOWED_ORIGINS=http://<your-server-ip>
DB_HOST=<your-db-server-ip>
DB_NAME=brose_db
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_PORT=5432
```

### 2. Collect static files

```bash
cd MES_Backend
python manage.py collectstatic --noinput
```

### 3. Run backend with Gunicorn

```bash
gunicorn brose_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

Do **not** use `python manage.py runserver` in production.

### 4. Build and serve frontend

```bash
cd MES_Frontend

# Set production API URL
echo VITE_API_BASE_URL=http://<your-server-ip>/api > .env

npm install
npm run build
```

Serve the resulting `MES_Frontend/dist/` folder via nginx or any static file host.

### Production Checklist

- [ ] `DEBUG=False` in backend `.env`
- [ ] `SECRET_KEY` is a strong random value
- [ ] `ALLOWED_HOSTS` set to real server IP/domain
- [ ] `CORS_ALLOWED_ORIGINS` set to real frontend URL
- [ ] `python manage.py migrate` run on server DB
- [ ] `python manage.py setup_project` run to seed base data
- [ ] `python manage.py collectstatic` run
- [ ] Gunicorn running (not runserver)
- [ ] Frontend built with `npm run build` and `dist/` served via nginx
- [ ] `VITE_API_BASE_URL` points to real server in frontend `.env`
