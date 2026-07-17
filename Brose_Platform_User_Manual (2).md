# Brose Plant Digitalization — User Manual

**Plant Digitalization Platform**

---

## Table of Contents

1. Introduction
   - 1.1 Scope of Application (Version 1)
2. Getting Started
   - 2.1 Logging In
   - 2.2 Logging Out
   - 2.3 Session Expiry
3. Navigating the Platform
4. Home
5. Master Data — Machine Layout & Reason Codes
   - 5.1 Section 1 — Machine Layout
   - 5.2 Section 2 — Reason Code Definition
6. Master Data — Variant, Shift & Planning
   - 6.1 Section 1 — Variant Definition
   - 6.2 Section 2 — Shift Definition
   - 6.3 Section 3 — Shift Planning
7. Manual Transaction Entry
   - 7.1 Step 1 — Select the Header
   - 7.2 Step 2 — Downtime & OEE
   - 7.3 Step 3 — Production Data
   - 7.4 Step 4 — Customer Complaint
   - 7.5 Saving Sections
   - 7.6 Calculating KPIs
8. Production Dashboard
   - 8.1 Filters (left sidebar)
   - 8.2 KPI Cards
   - 8.3 Overview Tab
   - 8.4 Production Analysis Tab
   - 8.5 Export to Excel
9. Settings
   - 9.1 User Management Tab
   - 9.2 Role Management Tab
   - 9.3 App Configuration Tab
   - 9.4 My Profile Tab
10. Roles & Permissions

---

## 1. Introduction

This Platform replaces manual, paper-based shift logs with a structured digital system. It is organized around a simple hierarchy that mirrors how a physical factory is arranged:

```
Plant
 └── Work Center
      └── Workstation
           └── Module / Machine
```

Using the platform generally follows three steps, in this order:

1. **Configure Master Data** — set up your plant hierarchy, reason codes, shifts, and product variants. This must happen before anything else.
2. **Record Transactions** — each shift, operators log downtime, production counts, then calculate KPIs.
3. **Monitor Performance** — supervisors use the Production Dashboard to review KPIs and trends.

An additional **Settings** area lets Administrators manage user accounts, roles, and page-level access.

**Note:** What a user can see and do depends on their assigned **Role**. If a menu item described in this manual isn't visible, that account may not have permission for that page — contact your administrator.

### 1.1 Scope of Application (Version 1)

The platform consists of three main modules: Master Data Configuration, Manual Transactional Data Entry, and the Production Dashboard.

**In Scope for Version 1:**
- **Master Data Configuration:** Machine Layout, Variant Type, Shift Definition and Planning, Reason Code Definition.
- **Manual Transactional Data Entry:** Downtime & OEE Data, Production Data, KPI Calculation.
- **Production Dashboard:** Overview tab and Production Analysis tab.

**Out of Scope for Version 1:**
- Customer Complaint & Accident Data entry (section visible but marked as not yet available).

---

## 2. Getting Started

### 2.1 Logging In

1. Open the Brose Platform in your browser.
2. On the login screen, enter your **Employee ID**.
   - You only need to type the numeric portion (e.g. `00000001`). The system automatically adds the `BR-` prefix.
3. Enter your **Password**.
4. Click **Sign In**.

If your credentials are correct, you will be taken automatically to the first page you have permission to view (Home, Transactions, Production, Master Data, or Settings — in that priority order).

**Common login errors:**

| Message | Meaning |
|---|---|
| "Invalid credentials" | Employee ID or password is incorrect. |
| "Your account has been deactivated. Please contact your administrator." | An admin has deactivated your account. You cannot log in until it is reactivated. |

### 2.2 Logging Out

Click your Employee ID in the top-right corner of the screen, then select **Logout** from the dropdown menu.

### 2.3 Session Expiry

The login session lasts 8 hours. If it expires while you are using the app, you will be automatically returned to the login screen — simply log in again. Any unsaved work on the current screen may be lost, so save frequently.

---

## 3. Navigating the Platform

After logging in, you will see three main areas on every screen:

- **Sidebar (left)** — the main navigation menu. Only shows pages you have permission to access:
  - **Home** — welcome/overview page
  - **Master Data** — two sub-screens: *Machine Layout & Reason Code* and *Variant, Shift & Planning*
  - **Manual Transaction** — where operators log shift data
  - **Production Dashboard** — performance charts and KPIs

- **Header (top)** — shows the current page title on the left, and on the right your Employee ID with a dropdown menu containing:
  - Your Employee ID and Role(s) (display only)
  - **Settings** (Administrators only)
  - **Logout**

- **Content area (center)** — the actual page content, changes based on what you clicked in the sidebar.

**Filter state is preserved across navigation.** If you select filters on the Production Dashboard or fill in the Transaction header, then navigate to another page and come back, your selections will still be there. They are only cleared when you explicitly change a header field or complete a transaction.

---

## 4. Home

The Home page is an informational landing page. It includes:

- A welcome banner with a short description of the platform.
- A short write-up **About Brose**.
- Four cards summarizing **How to Use This Application** — Master Data, Manual Transaction, Production Dashboard, and Settings — with a recommended order (Step 1 → Step 2 → Step 3 → Admin).
- A **Recommended Workflow** timeline reiterating the 3-step process.
- A **Platform Features** section highlighting Downtime Tracking, Production Recording, and Performance Visibility.
- A link to this **Manual**.

There is no data entry on this page — it is purely for orientation. New users should read this page first.

---

## 5. Master Data — Machine Layout & Reason Code Definition

The Master Data Configuration Module is responsible for entering all master data required as a prerequisite before transactions can be recorded.

This screen has two main sections:
1. Machine Layout & Reason Code
2. Variant, Shift & Planning

### 5.1 Section 1 — Machine Layout

**The Hierarchy Concept**

The platform organizes your factory based on the following structural concept:

```
Plant  (SAP Plant where production happens)
 └── Work Centre  (Production Line)
      └── Work Station  (Logical grouping of Machines)
           └── Module  (Machines)
```

**Restriction Note:** Each entity in the hierarchy must have a unique name across the entire system.

**To add a new Plant / Work Center / Workstation:**

Click the **Manage** button (top-right of Section 1) to open a pop-up with three tabs:

**Tab: Plant**
- Type a Plant Name and click **ADD** to create a new Plant.
- Toggle **Show Deactivated** to view inactive Plants.
- Each Plant row has a **Deactivate/Activate** action.
  - **Deactivating a Plant cascades**: it will also deactivate every Work Center, Workstation, and Machine that belongs to it. You will be warned before confirming.
  - Reactivating a Plant does **not** automatically reactivate its Work Centers — you must reactivate those separately, one level at a time.

**Tab: Work Center**
- Select the parent **Plant**, type a **Work Center Name**, click **ADD**.
- Same cascade rule applies: deactivating a Work Center also deactivates its Workstations and Machines.
- You cannot delete a Work Center that still has active Workstations assigned to it.

**Tab: Workstation**
- Select the parent **Work Center**, type a **Workstation Name**, click **ADD**.
- You cannot delete a Workstation that still has active Machines assigned to it.

**Design tip:** Always build the hierarchy top-down: Plant → Work Center → Workstation → Machine. You cannot create a Work Center without first creating its Plant, and so on.

**To add a new Machine/Module:**

1. Select a **Plant** from the dropdown.
2. Select a **Work Centre** (only Work Centres belonging to the chosen Plant appear).
3. Select a **Work Station** (only ones belonging to the chosen Work Centre appear).
4. Type a **Module** name (letters, numbers, spaces, hyphens, and underscores only — no special characters).
5. Click **ADD**.

**Managing existing machines:**

- Each row in the table has a **Deactivate**/**Activate** action on the right.
- Deactivating asks for confirmation first. Deactivated machines are grayed out — toggle **Show Deactivated** above the table to see them.
- Machines cannot be permanently deleted; deactivating is the only removal method, which preserves historical records tied to them.

### 5.2 Section 2 — Reason Code Definition

Reason Codes classify why something happened — e.g., why a machine went down, or why a part was rejected (NOK).

**To add a new Reason Code:**

1. Enter a **Reason Code** (letters, numbers, hyphens, underscores only — e.g. `TO`, `NOK-SC`).
2. Enter a **Description** (plain text, no special characters).
3. Enter a **Category** (`Machine Downtime`, `Scrap`, or `NOK`).
4. Enter a **Reason Type** (required for Machine Downtime category — e.g. `TO: Organizational Downtime`).
5. Click **ADD**.

**Pre-seeded Reason Codes** (available on every fresh installation):

| Code | Description | Category |
|---|---|---|
| TO | TO: Organizational Downtime | Machine Downtime |
| TT | TT: Technical Downtime | Machine Downtime |
| TNB | TNB: Non Occupation Time | Machine Downtime |
| TR | TR: Change Overtime | Machine Downtime |
| TW | TW: Maintenance Cause Downtime | Machine Downtime |
| TA | TA: Short-term Lack of Job | Machine Downtime |
| TN | TN: Utilization Time (Running) | Machine Downtime |
| TP | TP: Performance Downtime | Machine Downtime |
| TB | TB: Utilization Time | Machine Downtime |
| PD | Planned Downtime | Machine Downtime |
| UD | Unplanned Downtime | Machine Downtime |
| SC-OP | Operator | Scrap |
| SC-MF | Machine Failure | Scrap |
| NOK-SC | Scrap | NOK |
| NOK-RW | Rework | NOK |
| NOK-RT | Retest | NOK |

**To edit a Reason Code:** Click **Edit** on its row. You can update Description, Category, and Reason Type (the Reason Code itself cannot be changed once created). Click **Save**.

**To remove a Reason Code:** Click **Deactivate**, then confirm. This is a soft delete — the code stays in the system for historical transactions but will not appear in new dropdown selections.

---

## 6. Master Data — Variant, Shift & Planning

This screen has three sections:
1. Variant
2. Shift
3. Planning

### 6.1 Section 1 — Variant Definition

"Variants" are the products/parts your plant manufactures.

**To add a Variant:**

1. Enter a **Material Number** (the product/part code).
2. Enter a **Material Description**.
3. Select one or more **Traceability Levels**: `Serial`, `Batch`, or `None`.
4. Click **ADD**.

**To edit a Variant:** Click **Edit**, update Description and/or Traceability Level, click **Save**. (Material Number cannot be changed after creation.)

**To remove a Variant:** Click **Deactivate** (soft delete only).

### 6.2 Section 2 — Shift Definition

Defines the working shifts at the plant (e.g. Morning, Evening, Night).

**To add a Shift:**

1. Enter a **Shift Name**.
2. Set **Shift Start** and **Shift End** times using the time pickers.
3. Optionally set **Break Start** and **Break End** times.
4. Click **ADD**.

**Validation rules:**
- Shift End must be after Shift Start.
- If you set a break, both Break Start and Break End must be filled in.
- Break End must be after Break Start.
- The break must fall entirely within the shift window.
- Two shifts assigned to the same Work Centre cannot have overlapping time windows.

**To edit a Shift:** Click **Edit**, adjust any field, click **Save**. Same validation rules apply.

**To remove a Shift:** Click **Deactivate**.

### 6.3 Section 3 — Shift Planning

This links a **Shift** to a **Work Centre** — i.e., "this shift runs at this work center."

**To add a Shift Planning entry:**

1. Select a **Shift**.
2. Select a **Work Centre**.
3. Select **Active**: Yes or No.
4. Click **ADD**.

You cannot create a duplicate Shift + Work Centre combination. You also cannot assign a shift that overlaps in time with another shift already planned for the same Work Centre.

---

## 7. Manual Transaction Entry

This is the page operators use every shift to log what happened on the floor. Navigate to **Manual Transaction**.

### 7.1 Step 1 — Select the Header

At the top of the page, fill in all four fields:

1. **Plant**
2. **Work Centre** (filtered by the selected Plant)
3. **Shift** (filtered by shifts planned for the selected Work Centre)
4. **Date**

The **SHOW** and **EDIT** buttons are disabled until all four header fields are filled in.

Click **SHOW** to load data.

- If a transaction **already exists** for that exact combination, all previously entered data loads automatically in **read-only** mode. Click **EDIT** to unlock it for changes (you will get a confirmation prompt if there is existing data).
- If **no transaction exists yet**, the form opens in edit mode automatically so you can begin entering new data.

**Important:** Changing any header field (Plant, Work Centre, Shift, or Date) after data has been loaded will clear all section data, so you start fresh for the new selection.

### 7.2 Step 2 — Downtime & OEE

This section has three sub-tables:

**A. Machine Downtime Classification**
- Select the **Module** that went down.
- Select the **Reason Code** (only Machine Downtime category codes appear here).
- Enter the **Duration** in seconds. The maximum allowed is the total shift duration in seconds.
- Click **ADD** to add the row. Repeat for every downtime event that occurred in the shift.

**B. Machine Target Cycle Time**
- Select a **Module**.
- Enter its **Target Cycle Time** in seconds.
- Click **ADD**.

**Note:** Every module that has a downtime entry in Section A must also have a Target Cycle Time entry in Section B. The CALCULATE button will be blocked if any module is missing its cycle time.

**C. Resource Planning**
- Select a **Work Station**.
- Enter the **Resource Count** (number of people/resources assigned).
- Optionally enter **Resource Names**.
- Click **ADD**.

Every row in these tables can be removed individually using the trash icon (only while in edit mode).

### 7.3 Step 3 — Production Data

For each product variant produced during the shift:

- Select the **Variant Type**.
- Enter the **OK Count** (good parts produced).
- Optionally enter the **NOK Count** (defective parts).
- If there is an NOK Count above zero, also select a **NOK Type** (Scrap / Rework / Retest) and an **NOK Reason Code** (only NOK-category codes appear, and the available codes are filtered by the selected NOK Type).
- Click **ADD**.

### 7.4 Step 4 — Customer Complaint

**Not yet available** in Version 1.

### 7.5 Saving Sections

Each sub-section (A, B, C, Production Data) has its own **SAVE** button. Click **SAVE** within a section after adding all rows for that section.

- Saving a section sends only that section's data to the server and confirms it was stored.
- After a successful save, the section returns to read-only mode. Click **EDIT** within the section to make further changes.
- The **CALCULATE** button (top-right of the page) becomes enabled once at least one section has been saved.

**Tip:** Use **SHOW** first before entering data, even for a new entry — this confirms whether a transaction already exists for that date/shift and prevents accidentally duplicating work.

### 7.6 Calculating KPIs

After saving your section data, click **CALCULATE** (top-right of the page).

- CALCULATE is only enabled after at least one section has been saved.
- It computes OEE, Availability (EA), Performance (PE), and Quality Rate (QR) at the module, workstation, and work-center level, and saves the results to the database.
- On success, a confirmation message appears. You can then continue working on the same transaction (e.g. add more data and recalculate) — the form is **not** cleared after calculating. This allows operators to recalculate the same shift multiple times without re-entering everything.
- The form and header are only cleared when you change a header field (Plant, Work Centre, Shift, or Date) to start a new transaction.

**KPI formulas used:**

| KPI | Formula |
|---|---|
| OEE | (OK Parts × Target Cycle Time) ÷ TB |
| Availability (EA) | TN ÷ TB |
| Performance (PE) | (Target Cycle Time × Total Parts) ÷ TN |
| Quality Rate (QR) | OK Parts ÷ Total Parts |

Where TB = total utilization time (TO + TN + TT + TW downtime codes) and TN = running time.

The bottleneck rule applies: when a Work Centre has multiple workstations, the workstation with the **fastest (minimum) target cycle time** is used as the reference for the work-center-level KPI.

---

## 8. Production Dashboard

Navigate to **Production Dashboard** to view performance data with charts and KPIs.

### 8.1 Filters (left sidebar)

All filters are optional and cascade downward (selecting a Plant narrows the Work Centre list, etc.):

- **Plant**
- **Work Centre**
- **Work Station**
- **Shift**
- **Variant**
- **Date** (single date)

Filter selections are preserved when you navigate away and return to this page.

Click **Refresh** to manually re-fetch data with the current filters. The dashboard also auto-fetches whenever a filter changes.

Click **Export Excel** to download the current dashboard data as a `.xlsx` file (see Section 8.5).

### 8.2 KPI Cards

At the top of the page, five summary cards always show (when data exists):

| KPI | Meaning |
|---|---|
| Total Production | Total parts made (OK + NOK) |
| OK Count | Good parts produced |
| NOK Count | Defective parts produced |
| Quality Rate | OK ÷ Total, as a percentage |
| Total Downtime | Sum of all downtime durations (displayed as mm:ss) |

Hovering over any of these cards shows a descriptive tooltip with the exact values.

### 8.3 Overview Tab

The Overview tab shows production and downtime charts. It is only shown when matching data exists.

**OEE Gauge**

A semicircular gauge card displays the **OEE** value for the current filter selection:

- The arc fills proportionally to the OEE value (0 to 1 scale).
- Color changes dynamically based on performance:
  - **Green** — OEE ≥ 0.85 (good)
  - **Yellow** — OEE between 0.60 and 0.84 (acceptable)
  - **Red** — OEE below 0.60 (needs attention)
- The numeric OEE value is displayed in the center of the gauge.
- **Note:** The OEE gauge is hidden when a Variant filter is active, because OEE is an equipment metric and is not variant-specific.

**Charts (displayed beside and below the OEE gauge):**

- **Downtime by Reason Code (mm:ss)** — bar chart of total downtime per reason code, displayed beside the OEE gauge.
- **Total Production Volume** — bar chart comparing OK vs. NOK per product variant (full width).
- **OK Count by Variant** — bar chart of good parts per variant.
- **NOK Count by Variant** — bar chart of defective parts per variant.

### 8.4 Production Analysis Tab

The Production Analysis tab shows equipment efficiency KPIs and the production trend over time.

**EA / PE / QR Cards**

Three KPI cards are shown at the top of this tab:

| Card | Meaning |
|---|---|
| Availability (EA) | TN ÷ TB — proportion of planned time the equipment was running |
| Performance (PE) | (Cycle Time × Total Parts) ÷ TN — how fast the equipment ran vs. target |
| Quality (QR) | OK Parts ÷ Total Parts — proportion of good output |

These values are sourced based on the active filter level:
- **Workstation selected** — shows that specific workstation's own EA/PE/QR from its saved KPI record.
- **Work Centre selected (no workstation)** — shows the work-center-level combined EA/PE/QR.
- **Variant filter active** — EA/PE/QR cards are hidden (OEE metrics are not variant-specific).

**Production Trend by Date**

A line chart showing OK and NOK counts over time. Useful when no single date filter is applied, to see trends across multiple shifts or days.

### 8.5 Export to Excel

Click **Export Excel** in the left sidebar (below the Refresh button) to download the current dashboard data.

The exported `.xlsx` file contains up to five sheets:

| Sheet | Contents |
|---|---|
| KPI Summary | All top-level KPI values including OEE metrics |
| OEE by Workstation | Per-workstation OEE/EA/PE/QR with TB and TN values |
| Production by Variant | OK and NOK counts per variant |
| Downtime by Reason | Reason code, description, and total duration in seconds |
| Production Trend | Date-by-date OK and NOK counts |

The filename includes the active filter values and a timestamp (e.g. `Production_Dashboard_Plant-A_WCA-01_20250115_1430.xlsx`).

The Export button is disabled until data has been loaded.

---

## 9. Settings

Visible only to users with the **Admin** role. Accessible via the dropdown menu in the top-right header.

### 9.1 User Management Tab

**Employee list:** Search by Employee ID or Name using the search box.

**To add a new Employee:**
1. Enter the numeric portion of the Employee ID (the `BR-` prefix is added automatically).
2. Enter the employee's **Name**.
3. Enter a **Password** meeting these requirements:
   - At least 8 characters
   - At least 1 uppercase letter
   - At least 1 number
4. Select one or more **Roles**.
5. Click **ADD**.

**To edit an Employee:** Click **Edit** to open a pop-up where you can update Name, Roles, and optionally set a new Password (leave blank to keep the current one).

**To activate/deactivate an Employee:** Click the **Activate**/**Deactivate** link in their row. Deactivated employees cannot log in.

### 9.2 Role Management Tab

Roles control which pages a user can access.

**To add a Role:**
1. Enter a **Role Name**.
2. Select one or more **Access Scope** pages (Home, Master Data, Transactions, Production, Settings).
3. Click **ADD**.

**To edit a Role:** Click **Edit**, adjust the name and/or access scope, click **Save**.

**To delete a Role:** Click **Delete**. If any employees are currently assigned to that role, deletion will be blocked — you must reassign those employees to a different role first.

### 9.3 App Configuration Tab

Reserved for future settings. Currently empty.

### 9.4 My Profile Tab

Every user (not just Admins) can view their own:
- Employee ID
- Assigned Role(s)
- Access scope

...and change their own password:

1. Enter your **Current Password**.
2. Enter a **New Password** (8+ characters, 1 uppercase, 1 number).
3. Enter the same value again in **Confirm New Password**.
4. Click **Update Password**.

If your current password is wrong, or the new password does not meet the rules, or the confirmation does not match, you will see an inline error message.

---

## 10. Roles & Permissions

Access to each page is controlled per-Role via the **Access Scope** setting (Section 9.2). A user may hold multiple roles; their accessible pages are the union of all their roles' permissions.

**Default roles seeded on every installation:**

| Role | Pages Accessible |
|---|---|
| Admin | Home, Master Data, Transactions, Production Dashboard, Settings |
| Manager | Home, Production Dashboard |
| Supervisor | Home, Transactions, Master Data |
| Operator | Home, Transactions |

**Page keys reference:**

| Page Key | Sidebar Page |
|---|---|
| `dashboard` | Home |
| `master_data` | Master Data (both screens) |
| `transactions` | Manual Transaction |
| `production` | Production Dashboard |
| `settings` | Settings |

If you try to access a page you do not have permission for (e.g. via an old bookmark), you will be automatically redirected to the first page you do have access to, or to the login screen if you have none.

---
