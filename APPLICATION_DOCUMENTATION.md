# Brose Plant Digitalization Platform — Application Documentation

> **Status**: In Development | **Last Updated**: 2026-07-01

---

## 1. Application Overview

**Application Name**: Brose Plant Digitalization Platform
**Purpose**: A web-based internal platform for managing plant operations, production data, employee access, and master configurations at Brose manufacturing facilities.

**Current Development Status**:
- Frontend UI — Completed
- Backend API — Completed
- Authentication — Completed
- Employee Management — Completed
- Role-Based Access Control (Multi-Role) — Completed
- Master Data, Transaction, Production Dashboard — Frontend only (not yet connected to backend)

---

## 2. Modules Implemented

| Module | Status | Description |
|---|---|---|
| Authentication | Complete | JWT-based login using Employee ID and password |
| Employee Management | Complete | Add, edit, search employees with role assignment |
| Role Management | Complete | Fetch and assign roles to employees |
| Dashboard | Frontend Only | Overview page for Admin, Manager, Supervisor |
| Master Data Screen 1 | Frontend Only | Machine Layout & Reason Code configuration |
| Master Data Screen 2 | Frontend Only | Variant, Shift & Planning configuration |
| Manual Transaction | Frontend Only | Transaction entry page for Operators and Supervisors |
| Production Dashboard | Frontend Only | Production KPI view for Managers and Supervisors |
| Settings / User Management | Complete | Admin panel to manage employees and roles |

---

## 3. User Roles & Access

### Available Roles

| Role | Purpose |
|---|---|
| Admin | Full system access including user management |
| Manager | View dashboards and production data |
| Supervisor | Manage transactions and view production |
| Operator | Enter manual transactions only |

---

### Role Permissions

#### Admin
- **Pages**: Dashboard, Master Data (Screen 1 & 2), Manual Transaction, Production Dashboard, Settings
- **Actions**: View, Add, Edit all employees and roles
- **Restrictions**: None

#### Manager
- **Pages**: Dashboard, Production Dashboard
- **Actions**: View only
- **Restrictions**: No access to Master Data, Transactions, or Settings

#### Supervisor
- **Pages**: Dashboard, Manual Transaction, Production Dashboard
- **Actions**: View dashboard, enter transactions
- **Restrictions**: No access to Master Data or Settings

#### Operator
- **Pages**: Manual Transaction only
- **Actions**: Enter transactions
- **Restrictions**: No access to Dashboard, Master Data, Production, or Settings

---

### Multi-Role Support

An employee can be assigned multiple roles. Permissions are combined as a **union** — the employee gets access to all pages and actions from all assigned roles.

**Example**:
- Manager + Operator → Dashboard + Production Dashboard + Manual Transaction
- Admin + Supervisor → All pages

---

## 4. How to Use the Application

### Logging In
1. Open the application at `http://localhost:5173`
2. Enter your Employee ID in the format `BR-00000001` (type digits only, BR- is added automatically)
3. Enter your password
4. Click **Sign In**
5. You will be redirected based on your role — Operators go to Manual Transaction, all others go to Dashboard

### Creating an Employee
1. Log in as **Admin**
2. Click the user avatar (top right) → **Settings**
3. Under **User Management**, fill in:
   - Employee ID (8 digits, BR- prefix is automatic)
   - Name (letters and spaces only)
   - Password (min 8 chars, 1 uppercase, 1 number)
   - Select one or more roles from the multi-select dropdown
4. Click **ADD**
5. A success popup confirms the employee was created

### Assigning Roles
- Roles are assigned during employee creation or via the Edit modal
- Multiple roles can be selected from the dropdown
- At least one role must be selected

### Editing Employee Details
1. Go to **Settings → User Management**
2. Find the employee in the table
3. Click **Edit**
4. Update name, roles, or password (leave password blank to keep current)
5. Click **Save**

### Deleting Employees
- Not yet implemented (planned)

### Viewing Dashboards
- Log in with Admin, Manager, or Supervisor role
- Dashboard is the default landing page
- Production Dashboard is accessible from the sidebar

### Logging Out
1. Click the user avatar (top right)
2. Click **Logout**
3. You will be redirected to the Login page

---

## 5. Backend Features Completed

- **Login API** — validates employee credentials, returns JWT access and refresh tokens
- **Employee List API** — returns all active employees with their assigned roles
- **Create Employee API** — creates employee with hashed password and multiple role assignments
- **Edit Employee API** — updates name, password, and roles for an existing employee
- **Role List API** — returns all available roles
- **JWT Authentication** — custom implementation using `TblEmployee` model (not Django default User)
- **Multi-Role JWT** — token stores `roles` as a list, frontend reads union of permissions
- **Password Hashing** — all passwords stored using Django's `make_password`
- **CORS** — configured for frontend at `localhost:5173`

---

## 6. Validations Implemented

### Employee ID
- Required
- Must match format `BR-XXXXXXXX` (BR- followed by exactly 8 digits)

### Employee Name
- Required — cannot be empty
- Must contain only letters and spaces
- Numbers and special characters are not allowed
- Error: *"Employee name is required"* / *"Employee name cannot contain special characters or numbers"*

### Password
- Minimum 8 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 number

### Role Assignment
- At least one role must be selected
- Error: *"Please select at least one role"*

### Duplicate Employee ID
- Backend checks if Employee ID already exists before creating
- Error: *"Employee ID already exists"*

### Authentication
- All protected API endpoints require a valid JWT token
- Invalid or missing token returns 401 Unauthorized

### All validations are enforced on both frontend and backend — they cannot be bypassed from the client side.

---

## 7. API Summary

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/auth/login/` | POST | Employee login, returns JWT tokens | No |
| `/api/employees/` | GET | List all active employees with roles | No* |
| `/api/employees/` | POST | Create a new employee | No* |
| `/api/employees/<id>/` | PATCH | Edit employee name, password, roles | No* |
| `/api/roles/` | GET | List all available roles | No* |

> *Authentication enforcement on these endpoints is planned — currently open for development convenience.

---

## 8. Current Limitations

| Area | Limitation |
|---|---|
| Delete Employee | Not yet implemented |
| Master Data Screen 1 & 2 | Frontend only, not connected to backend |
| Manual Transaction | Frontend only, not connected to backend |
| Production Dashboard | Frontend only, not connected to backend |
| API Authorization | Employee and Role endpoints do not yet enforce JWT authentication |
| Password Reset | No self-service password reset — Admin must edit manually |
| Pagination | Employee list has no pagination — may be slow with large datasets |
| Audit Logging | No logging of who created or edited employees |
| Session Expiry | JWT expiry handling (auto-logout or token refresh) not yet implemented |

---

## 9. Change Log

| Date | Feature Added | Updated By | Remarks |
|---|---|---|---|
| 2026-06-29 | Full React UI built | Dev Team | Login, Dashboard, Master Data, Transaction, Production, Settings pages |
| 2026-06-29 | Django backend setup | Dev Team | Django 4.2 + PostgreSQL, 31 models migrated |
| 2026-06-29 | JWT Authentication | Dev Team | Custom auth using TblEmployee, login API working end to end |
| 2026-06-29 | Employee Management | Dev Team | Full CRUD — add, edit, search, password reset connected to PostgreSQL |
| 2026-06-29 | Role-Based Access Control | Dev Team | JWT stores role, sidebar filters menu, ProtectedRoute blocks unauthorized access |
| 2026-07-01 | Multi-Role Support | Dev Team | Employees can have multiple roles, permissions are union of all assigned roles |
| 2026-07-01 | Frontend Validations | Dev Team | Name, role, password validations with Modal error popups |
| 2026-07-01 | Auth Persistence | Dev Team | User session restored from localStorage on page refresh |
