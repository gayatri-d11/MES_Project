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

The `brose_backend/.env` file is not committed to Git. Create it manually:

```
DB_NAME=brose_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-django-secret-key
DEBUG=True
```

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

---

## Summary Checklist

- [ ] PostgreSQL and pgAdmin installed and running
- [ ] `brose_db` database created via pgAdmin
- [ ] `.env` file created in `brose_backend/`
- [ ] `pip install -r requirements.txt` done
- [ ] `python manage.py migrate` done
- [ ] `python manage.py setup_project` done
- [ ] `npm install` done in `brose-platform/`
- [ ] Both servers running (port 8000 and 5173)
