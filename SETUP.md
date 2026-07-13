# Brose Platform — New Machine Setup Guide

Follow these steps in order on any new machine.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ with pgAdmin (must be installed and running)

---

## 1. Database Setup

**pgAdmin is required for this step.**

Open pgAdmin (or psql CLI) and create the database:

```sql
CREATE DATABASE brose_db;
```

Make sure your PostgreSQL user is `postgres` with password `postgres` on port `5432`.
If different, update the `.env` file in `brose_backend/` accordingly.

> pgAdmin is also useful for inspecting tables, running queries, and debugging data issues during development.
> You will need it throughout the project — not just for setup.

---

## 2. Environment File

The `brose_backend/.env` file is not committed to Git. Copy the example and fill in your values:

```bash
cd brose_backend
copy .env.example .env
```

Then open `.env` and set your values:

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

Also create the frontend `.env`:

```bash
cd brose-platform
copy .env.example .env
```

The default value `VITE_API_BASE_URL=http://localhost:8000/api` is correct for local dev — no changes needed.

---

## 3. Backend Setup

```bash
cd brose_backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

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
- Sample plant, work centers, workstations, machines
- All 14 standard Brose reason types
- Reason codes, shifts, shift planning, products

Default admin login:
- Employee No: `BR-00000001`
- Password: `Admin@123`

> **Why this command instead of SQL files?**
> The `setup_project` command uses Django's ORM, so it works on any database and respects
> your models. It has proper error handling and is safe to run multiple times (idempotent).
> Raw `.sql` files are PostgreSQL-specific, have no error handling, and break if run before
> migrations. This is the correct approach for a corporate project.

---

## 5. Start Backend

```bash
python manage.py runserver
```

Backend runs at: http://localhost:8000

---

## 6. Frontend Setup

```bash
cd brose-platform

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:5173

> Make sure the frontend `.env` file exists (created in Step 2). Without it, the app will still
> work using the fallback URL, but it is good practice to have it in place.

---

## Summary Checklist

- [ ] PostgreSQL and pgAdmin installed and running
- [ ] `brose_db` database created via pgAdmin
- [ ] `brose_backend/.env` file created (copied from `.env.example`)
- [ ] `brose-platform/.env` file created (copied from `.env.example`)
- [ ] `pip install -r requirements.txt` done
- [ ] `python manage.py migrate` done
- [ ] `python manage.py setup_project` done
- [ ] `npm install` done in `brose-platform/`
- [ ] Both servers running (port 8000 and 5173)

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
cd brose_backend
python manage.py collectstatic --noinput
```

This copies all static files into `brose_backend/staticfiles/`. Serve this folder via nginx.

### 3. Run backend with Gunicorn

```bash
gunicorn brose_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

Do **not** use `python manage.py runserver` in production.

### 4. Build and serve frontend

```bash
cd brose-platform

# Set production API URL
echo "VITE_API_BASE_URL=http://<your-server-ip>/api" > .env

npm install
npm run build
```

Serve the resulting `brose-platform/dist/` folder via nginx or any static file host.

### Production Checklist

- [ ] `DEBUG=False` in backend `.env`
- [ ] `SECRET_KEY` is a strong random value (not the dev key)
- [ ] `ALLOWED_HOSTS` set to real server IP/domain
- [ ] `CORS_ALLOWED_ORIGINS` set to real frontend URL
- [ ] `python manage.py migrate` run on server DB
- [ ] `python manage.py setup_project` run to seed base data
- [ ] `python manage.py collectstatic` run
- [ ] Gunicorn running (not runserver)
- [ ] Frontend built with `npm run build` and `dist/` served via nginx
- [ ] `VITE_API_BASE_URL` points to real server in frontend `.env`
