# Brose Plant Digitalization — Manual

**Plant Digitalization Platform**


---

## Table of Contents

1. Introduction
   1.1 Scope of Application (Version 1)
2. Getting Started
   2.1 Logging In
   2.2 Logging Out
   2.3 Session Expiry
3. Navigating the Platform
4. Home
5. Master Data — Machine Layout & Reason Codes
   5.1 Section 1 — Machine Layout
   5.2 Section 2 — Reason Code Definition
6. Master Data — Variant, Shift & Planning
   6.1 Section 1 — Variant Definition
   6.2 Section 2 — Shift Definition
   6.3 Section 3 — Shift Planning
7. Manual Transaction Entry
   7.1 Step 1 — Select the Header
   7.2 Step 2 — Downtime & OEE
   7.3 Step 3 — Production Data
   7.4 Step 4 — Customer Complaint & Accident Data
   7.5 Saving
8. Production Dashboard
   8.1 Filters (left sidebar)
   8.2 KPI Cards
   8.3 Charts
9. Settings
   9.1 User Management Tab
   9.2 Role Management Tab
   9.3 App Configuration Tab
   9.4 My Profile Tab
10. Roles & Permissions
---

## 1. Introduction

This Platform replaces manual, paper-based shift logs with a structured digital system. It is organized around a simple hierarchy that mirrors how a physical factory is arranged:


Using the platform generally follows three steps, in this order:

1. **Configure Master Data** — set up your plant hierarchy, reason codes, shifts, and product variants. This must happen before anything else.
2. **Record Transactions** — each shift, operators log downtime, production counts.
3. **Monitor Performance** — supervisors use the Production Dashboard to review KPIs and trends.

An additional **Settings** area lets Administrators manage user accounts, roles, and page-level access.

**Note:** What user can see and do depends on user's assigned **Role**. If a menu item described in this manual isn't visible, then that account may not have permission for that page — contact administrator.

### 1.1 Scope of Application (Version 1)

The digital platform consists of three main modules: the Master Data Configuration Module, the Manual Transactional Data Entry Module, and the Production Dashboard. 

**In Scope for Version 1:**
*   **Master Data Configuration:** Includes Machine Layout, Variant Type, Shift Definition and Planning, and Reason Code Definition.
*   **Manual Transactional Data Entry:** Includes Downtime & OEE Data, and Production Data.
*   **Production Dashboard:** Only the **Overview** tab is available for use.

**Out of Scope for Version 1:**
*   Customer Complaint & Accident Data entry.
*   The following Production Dashboard tabs are restricted/unavailable: Production Analysis, Quality Analysis, Efficiency & DownTime, Customer Complaint, and Accident Management.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the Brose Platform in browser.
2. On the login screen, enter **Employee ID**.
   - only need to type the numeric portion (e.g. `00000001`). The system automatically adds the `BR-` prefix for.
3. Enter your **Password**.
4. Click **Sign In**.

If your credentials are correct, user will be taken automatically to the first page where user have permission to view (Dashboard, Transactions, Production, Master Data, or Settings, in that priority order).

**Common login errors:**

| Message | Meaning |
|---|---|
| "Invalid credentials" | Employee ID or password is incorrect. |
| "Your account has been deactivated. Please contact your administrator." | An admin has deactivated your account. You cannot log in until it's reactivated. |

### 2.2 Logging Out

Click your name in the top-right corner of the screen, then select **Logout** from the dropdown menu.

### 2.3 Session Expiry

Login session lasts a limited number of hours. If it expires while using the app, user will be automatically returned to the login screen with a "Session expired" message — simply log in again. Any unsaved work on the current screen may be lost, so save frequently.

---

## 3. Navigating the Platform

After logging in, user will see three main areas on every screen:

- **Sidebar (left)** — the main navigation menu. Only shows pages user have permission to access:
  - **Home** — welcome/overview page
  - **Master Data** — two sub-screens: *Machine Layout & Reason Code* and *Variant, Shift & Planning*
  - **Manual Transaction** — where operators log shift data
  - **Production Dashboard** — performance charts and KPIs

- **Header (top)** — shows the current page title on the left, and on the right, user Employee ID with a dropdown menu containing:
  - User's Employee ID and Role(s) (display only)
  - **Settings** (Administrators only)
  - **Logout**

- **Content area (center)** — the actual page content, changes based on what user clicked in the sidebar.

---

## 4. Home

The Home is an informational landing page. It includes:

- A welcome banner with a short description of the platform.
- A short write-up **About Brose**.
- Three cards summarizing **How to Use This Application** — Master Data, Manual Transaction, Production Dashboard — with a recommended order (Step 1 → Step 2 → Step 3 ).
- A link for **Manual** 
- A **Recommended Workflow** timeline reiterating the 3-step process.
- A **Platform Features** section highlighting Downtime Tracking, Production Recording, and Performance Visibility.

There is no data entry on this page — it's purely for orientation. New users should read this page first.

---

## 5. Master Data - Machine Layout, Reason Code Definition
Master Data Configuration Module is responsible for entering all the master data required as a pre-requisite.

This screen has two main sections.
**Master Data:**
**1. Machine Layout & Reason Code 
2. Variant, Shift & Planning**

### 5.1 Section 1 — Machine Layout

**The Hierarchy Concept**
The platform organizes your factory based on the following structural concept:

```text
Plant (SAP Plant where production happens)
 └── Work Centre (Production Line)
      └── Work Station (Logical grouping of Machines)
           └── Module (Machines)
```
**Restriction Note:** Each entity detailed in the hierarchy above must have a unique name.

**To add new Plant / Work Center / Workstation:**

Click the **Manage** button (top-right of Section 1) to open a pop-up with three tabs:

**Tab: Plant**
- Type a Plant Name and click **ADD** to create a new Plant.
- Toggle **Show Deactivated** to view inactive Plants.
- Each Plant row has a **Deactivate/Activate** action.
  - **Deactivating a Plant cascades**: it will *also* deactivate every Work Center, Workstation, and Machine that belongs to it. You'll be warned before confirming.
  - Reactivating a Plant does **not** automatically reactivate its Work Centers — you must reactivate those separately, one level at a time.

**Tab: Work Center**
- Select the parent **Plant**, type a **Work Center Name**, click **ADD**.
- Same cascade rule applies: deactivating a Work Center also deactivates its Workstations and Machines.
- You cannot delete a Work Center that still has active Workstations assigned to it — reassign or deactivate those first.

**Tab: Workstation**
- Select the parent **Work Center**, type a **Workstation Name**, click **ADD**.
- You cannot delete a Workstation that still has active Machines assigned to it.

**Design tip:** Always build the hierarchy top-down: Plant → Work Center → Workstation → Machine. You can't create a Work Center without first creating its Plant, and so on.

This section lists every Machine/Module in the plant and lets you add new ones.

**To add a new Machine:**

1. Select a **Plant** from the dropdown. 
2. Select a **Work Centre** (only Work Centres belonging to the chosen Plant will appear).
3. Select a **Work Station** (only ones belonging to the chosen Work Centre will appear).
4. Type a **Module** name (letters, numbers, spaces, hyphens, and underscores only — no special characters).
5. Click **ADD**.

**Managing existing machines:**

- Each row in the table has a **Deactivate**/**Activate** action on the right.
- Deactivating asks for confirmation first. Deactivated machines are grayed out (not deleted) — toggle **Show Deactivated** above the table to see them.
- User cannot permanently delete a machine; deactivating is the only removal method, which preserves historical records tied to it.

### 5.2 Section 2 — Reason Code Definition

Reason Codes are used to classify why something happened — e.g., why a machine went down, or why a part was rejected (NOK).

**To add a new Reason Code:**

1. Enter a **Reason Code** (letters, numbers, hyphens, underscores only — e.g. `MD-001`).
2. Enter a **Description** (plain text, no special characters).
3. Enter a **Category** (e.g. "Machine Downtime" or "Scrap").
4. Enter a **Reason Type** (a more specific classification tag, e.g. "Organizational Downtime" or "Technical").
5. Click **ADD**.

**To edit a Reason Code:**

Click **Edit** on its row. You can update Description, Category, and Reason Type in the pop-up (the Reason Code itself cannot be changed once created). Click **Save**.

**To remove a Reason Code:**

Click **Deactivate**, then confirm. This is a soft delete — the code stays in the system for historical transactions but won't appear in new dropdown selections.


---

## 6. Master Data — Variant, Shift & Planning

This screen has three sections.
**Master Data:**
**1. Variant
2. Shift
3. Planning**

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

1. Enter a **Shift Name** (letters and spaces only).
2. Set **Shift Start** and **Shift End** times using the time pickers.
3. Optionally set **Break Start** and **Break End** times.
4. Click **ADD**.

**Validation rules:**
- Shift End must be after Shift Start.
- If you set a break, both Break Start and Break End must be filled in (not just one).
- Break End must be after Break Start.
- The break must fall entirely *within* the shift window.

**To edit a Shift:** Click **Edit**, adjust any field, click **Save**. Same validation rules apply.

**To remove a Shift:** Click **Deactivate**.

### 6.3 Section 3 — Shift Planning

This links a **Shift** to a **Work Centre** — i.e., "this shift runs at this work center."

**To add a Shift Planning entry:**

1. Select a **Shift**.
2. Select a **Work Centre**.
3. Select **Active**: Yes or No.
4. Click **ADD**.

You cannot create a duplicate Shift + Work Centre combination — the system will reject it if one already exists.

---

## 7. Manual Transaction Entry

This is the page operators use every shift to log what happened on the floor. Navigate to **Manual Transaction**.

### 7.1 Step 1 — Select the Header

At the top of the page, fill in:

1. **Plant**
2. **Work Centre** (filtered by the selected Plant)
3. **Shift**
4. **Date**

Then click **SHOW**.

- If a transaction **already exists** for that exact combination, all previously entered data loads automatically in **read-only** mode. Click **EDIT** to unlock it for changes (you'll get a warning if there's existing data, since editing may overwrite it).
- If **no transaction exists yet**, the form opens in edit mode automatically so you can begin entering new data.

### 7.2 Step 2 — Downtime & OEE

This section has three sub-tables:

**A. Machine Downtime Classification**
- Select the **Module** that went down.
- Select the **Reason Code** (only Machine Downtime category codes appear here).
- Enter the **Duration** in seconds.
- Click **ADD** to add the row. Repeat for every downtime event that occurred in the shift.

**B. Machine Target Cycle Time**
- Select a **Module**.
- Enter its **Target Cycle Time** in seconds.
- Click **ADD**.

**C. Resource Planning**
- Select a **Work Station**.
- Enter the **Resource Count** (number of people/resources assigned).
- Optionally enter **Resource Names**.
- Click **ADD**.

Every row in these tables can be removed individually using the trash icon before you save (only while in edit mode).

### 7.3 Step 3 — Production Data 

For each product variant produced during the shift:

- Select the **Variant Type**.
- Enter the **OK Count** (good parts produced).
- Optionally enter the **NOK Count** (defective parts).
- If there's an NOK Count above zero, also select a **NOK Type** (Scrap / Rework / Retest) and an **NOK Reason Code** (only NOK-category codes appear).
- Click **ADD**.

### 7.4 Step 4 — Customer Complaint 
**Not yet available**

### 7.5 Saving

All sections are filled in, click **SAVE** in the indivisual section. 
If You'll be asked to confirm — saving **overwrites** any existing transaction for that exact Plant + Work Centre + Shift + Date combination, so double-check your selections before confirming.

After a successful save, the form returns to read-only mode.

**Tip:** Use **SHOW** first before entering data, even for a new entry — this confirms whether a transaction already exists for that date/shift and prevents accidentally duplicating work.

---

## 8. Production Dashboard

Navigate to **Production Dashboard** to view performance data with charts and KPIs.

### 8.1 Filters (left sidebar)

All filters are optional and cascade downward (selecting a Plant narrows the Work Centre list, etc.):

- **Plant**
- **Work Centre**
- **Work Station**
- **Module**
- **Shift**
- **Variant**
- **Date** (single date)

Click **Refresh** to apply your filter selections. The dashboard also auto-refreshes whenever a filter changes.

### 8.2 KPI Cards

At the top of the results, five summary cards show:

| KPI | Meaning |
|---|---|
| Total Production | Total parts made (OK + NOK) |
| OK Count | Good parts produced |
| NOK Count | Defective parts produced |
| Quality Rate | OK ÷ Total, as a percentage |
| Total Downtime | Sum of all downtime seconds logged |

### 8.3 Charts

Below the KPIs (only shown if matching data exists):

- **Production by Variant** — bar chart comparing OK vs. NOK per product.
- **OK vs. NOK Distribution** — pie chart of overall quality split.
- **Production Trend by Date** — line chart showing OK/NOK over time (useful when no single date filter is applied).
- **Downtime by Reason Code** — bar chart of total downtime minutes per reason code.
- **NOK by Type** — pie chart breaking down defects by type (Scrap/Rework/Retest).

If no data matches your filters, you'll see an empty state message instead of blank charts.

---

## 9. Settings

Visible only to users with the **Admin** role. Accessible via the dropdown menu in the header.

### 9.1 User Management Tab

**Employee list:** Search by Employee ID or Name using the search box.

**To add a new Employee:**
1. Enter the numeric portion of the Employee ID (the `BR-` prefix is added automatically).
2. Enter the employee's **Name** (letters and spaces only).
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
1. Enter a **Role Name** (letters and spaces only).
2. Select one or more **Access Scope** (Dashboard, Master Data, Transactions, Production, Settings).
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
2. Enter a **New Password** (same rules as above: 8+ characters, 1 uppercase, 1 number).
3. Enter the same value again in **Confirm New Password**.
4. Click **Update Password**.

If your current password is wrong, or the new password doesn't meet the rules, or the confirmation doesn't match, you'll see an inline error.

---

## 10. Roles & Permissions

Access to each page is controlled per-Role via the **Access Scope** setting (Section 9.2). A user may hold multiple roles; their accessible pages are the union of all their roles' permissions.


If you try to access a page you don't have permission for (e.g. by an old bookmark), you'll be automatically redirected to the first page you *do* have access to, or to the login screen if you have none.

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
2. **Record Transactions** — each shift, operators log downtime, production counts.
3. **Monitor Performance** — supervisors use the Production Dashboard to review KPIs and trends.

An additional **Settings** area lets Administrators manage user accounts, roles, and page-level access.

**Note:** What user can see and do depends on user's assigned **Role**. If a menu item described in this manual isn't visible, then that account may not have permission for that page — contact administrator.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the Brose Platform in browser.
2. On the login screen, enter **Employee ID**.
   - only need to type the numeric portion (e.g. `00000001`). The system automatically adds the `BR-` prefix for.
3. Enter your **Password**.
4. Click **Sign In**.

If your credentials are correct, user will be taken automatically to the first page where user have permission to view (Dashboard, Transactions, Production, Master Data, or Settings, in that priority order).

**Common login errors:**

| Message | Meaning |
|---|---|
| "Invalid credentials" | Employee ID or password is incorrect. |
| "Your account has been deactivated. Please contact your administrator." | An admin has deactivated your account. You cannot log in until it's reactivated. |

### 2.2 Logging Out

Click your name in the top-right corner of the screen, then select **Logout** from the dropdown menu.

### 2.3 Session Expiry

Login session lasts a limited number of hours. If it expires while using the app, user will be automatically returned to the login screen with a "Session expired" message — simply log in again. Any unsaved work on the current screen may be lost, so save frequently.

---

## 3. Navigating the Platform

After logging in, user will see three main areas on every screen:

- **Sidebar (left)** — the main navigation menu. Only shows pages user have permission to access:
  - **Home** — welcome/overview page
  - **Master Data** — two sub-screens: *Machine Layout & Reason Code* and *Variant, Shift & Planning*
  - **Manual Transaction** — where operators log shift data
  - **Production Dashboard** — performance charts and KPIs

- **Header (top)** — shows the current page title on the left, and on the right, user Employee ID with a dropdown menu containing:
  - User's Employee ID and Role(s) (display only)
  - **Settings** (Administrators only)
  - **Logout**

- **Content area (center)** — the actual page content, changes based on what user clicked in the sidebar.

---

## 4. Home

The Home is an informational landing page. It includes:

- A welcome banner with a short description of the platform.
- A short write-up **About Brose**.
- Four cards summarizing **How to Use This Application** — Master Data, Manual Transaction, Production Dashboard, and Settings — with a recommended order (Step 1 → Step 2 → Step 3 → Admin).
- A **Recommended Workflow** timeline reiterating the 3-step process.
- A **Platform Features** section highlighting Downtime Tracking, Production Recording, and Performance Visibility.

There is no data entry on this page — it's purely for orientation. New users should read this page first.

---

## 5. Master Data - Machine Layout, Reason Code Definition
This screen has two main sections.
**Master Data:**
**1. Machine Layout & Reason Code 
2. Variant, Shift & Planning**

### 5.1 Section 1 — Machine Layout


**To add new Plant / Work Center / Workstation:**

Click the **Manage** button (top-right of Section 1) to open a pop-up with three tabs:

**Tab: Plant**
- Type a Plant Name and click **ADD** to create a new Plant.
- Toggle **Show Deactivated** to view inactive Plants.
- Each Plant row has a **Deactivate/Activate** action.
  - **Deactivating a Plant cascades**: it will *also* deactivate every Work Center, Workstation, and Machine that belongs to it. You'll be warned before confirming.
  - Reactivating a Plant does **not** automatically reactivate its Work Centers — you must reactivate those separately, one level at a time.

**Tab: Work Center**
- Select the parent **Plant**, type a **Work Center Name**, click **ADD**.
- Same cascade rule applies: deactivating a Work Center also deactivates its Workstations and Machines.
- You cannot delete a Work Center that still has active Workstations assigned to it — reassign or deactivate those first.

**Tab: Workstation**
- Select the parent **Work Center**, type a **Workstation Name**, click **ADD**.
- You cannot delete a Workstation that still has active Machines assigned to it.

**Design tip:** Always build the hierarchy top-down: Plant → Work Center → Workstation → Machine. You can't create a Work Center without first creating its Plant, and so on.

This section lists every Machine/Module in the plant and lets you add new ones.

**To add a new Machine:**

1. Select a **Plant** from the dropdown. 
2. Select a **Work Centre** (only Work Centres belonging to the chosen Plant will appear).
3. Select a **Work Station** (only ones belonging to the chosen Work Centre will appear).
4. Type a **Module** name (letters, numbers, spaces, hyphens, and underscores only — no special characters).
5. Click **ADD**.

**Managing existing machines:**

- Each row in the table has a **Deactivate**/**Activate** action on the right.
- Deactivating asks for confirmation first. Deactivated machines are grayed out (not deleted) — toggle **Show Deactivated** above the table to see them.
- User cannot permanently delete a machine; deactivating is the only removal method, which preserves historical records tied to it.

### 5.2 Section 2 — Reason Code Definition

Reason Codes are used to classify why something happened — e.g., why a machine went down, or why a part was rejected (NOK).

**To add a new Reason Code:**

1. Enter a **Reason Code** (letters, numbers, hyphens, underscores only — e.g. `MD-001`).
2. Enter a **Description** (plain text, no special characters).
3. Enter a **Category** (e.g. "Machine Downtime" or "Scrap").
4. Enter a **Reason Type** (a more specific classification tag, e.g. "Organizational Downtime" or "Technical").
5. Click **ADD**.

**To edit a Reason Code:**

Click **Edit** on its row. You can update Description, Category, and Reason Type in the pop-up (the Reason Code itself cannot be changed once created). Click **Save**.

**To remove a Reason Code:**

Click **Deactivate**, then confirm. This is a soft delete — the code stays in the system for historical transactions but won't appear in new dropdown selections.


---

## 6. Master Data — Variant, Shift & Planning

This screen has three sections.
**Master Data:**
**1. Variant
2. Shift
3. Planning**

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

1. Enter a **Shift Name** (letters and spaces only).
2. Set **Shift Start** and **Shift End** times using the time pickers.
3. Optionally set **Break Start** and **Break End** times.
4. Click **ADD**.

**Validation rules:**
- Shift End must be after Shift Start.
- If you set a break, both Break Start and Break End must be filled in (not just one).
- Break End must be after Break Start.
- The break must fall entirely *within* the shift window.

**To edit a Shift:** Click **Edit**, adjust any field, click **Save**. Same validation rules apply.

**To remove a Shift:** Click **Deactivate**.

### 6.3 Section 3 — Shift Planning

This links a **Shift** to a **Work Centre** — i.e., "this shift runs at this work center."

**To add a Shift Planning entry:**

1. Select a **Shift**.
2. Select a **Work Centre**.
3. Select **Active**: Yes or No.
4. Click **ADD**.

You cannot create a duplicate Shift + Work Centre combination — the system will reject it if one already exists.

---

## 7. Manual Transaction Entry

This is the page operators use every shift to log what happened on the floor. Navigate to **Manual Transaction**.

### 7.1 Step 1 — Select the Header

At the top of the page, fill in:

1. **Plant**
2. **Work Centre** (filtered by the selected Plant)
3. **Shift**
4. **Date**

Then click **SHOW**.

- If a transaction **already exists** for that exact combination, all previously entered data loads automatically in **read-only** mode. Click **EDIT** to unlock it for changes (you'll get a warning if there's existing data, since editing may overwrite it).
- If **no transaction exists yet**, the form opens in edit mode automatically so you can begin entering new data.

### 7.2 Step 2 — Downtime & OEE

This section has three sub-tables:

**A. Machine Downtime Classification**
- Select the **Module** that went down.
- Select the **Reason Code** (only Machine Downtime category codes appear here).
- Enter the **Duration** in seconds.
- Click **ADD** to add the row. Repeat for every downtime event that occurred in the shift.

**B. Machine Target Cycle Time**
- Select a **Module**.
- Enter its **Target Cycle Time** in seconds.
- Click **ADD**.

**C. Resource Planning**
- Select a **Work Station**.
- Enter the **Resource Count** (number of people/resources assigned).
- Optionally enter **Resource Names**.
- Click **ADD**.

Every row in these tables can be removed individually using the trash icon before you save (only while in edit mode).

### 7.3 Step 3 — Production Data 

For each product variant produced during the shift:

- Select the **Variant Type**.
- Enter the **OK Count** (good parts produced).
- Optionally enter the **NOK Count** (defective parts).
- If there's an NOK Count above zero, also select a **NOK Type** (Scrap / Rework / Retest) and an **NOK Reason Code** (only NOK-category codes appear).
- Click **ADD**.

### 7.4 Step 4 — Customer Complaint 
**Not yet available**

### 7.5 Saving

All sections are filled in, click **SAVE** in the indivisual section. 
If You'll be asked to confirm — saving **overwrites** any existing transaction for that exact Plant + Work Centre + Shift + Date combination, so double-check your selections before confirming.

After a successful save, the form returns to read-only mode.

**Tip:** Use **SHOW** first before entering data, even for a new entry — this confirms whether a transaction already exists for that date/shift and prevents accidentally duplicating work.

---

## 8. Production Dashboard

Navigate to **Production Dashboard** to view performance data with charts and KPIs.

### 8.1 Filters (left sidebar)

All filters are optional and cascade downward (selecting a Plant narrows the Work Centre list, etc.):

- **Plant**
- **Work Centre**
- **Work Station**
- **Module**
- **Shift**
- **Variant**
- **Date** (single date)

Click **Refresh** to apply your filter selections. The dashboard also auto-refreshes whenever a filter changes.

### 8.2 KPI Cards

At the top of the results, five summary cards show:

| KPI | Meaning |
|---|---|
| Total Production | Total parts made (OK + NOK) |
| OK Count | Good parts produced |
| NOK Count | Defective parts produced |
| Quality Rate | OK ÷ Total, as a percentage |
| Total Downtime | Sum of all downtime seconds logged |

### 8.3 Charts

Below the KPIs (only shown if matching data exists):

- **Production by Variant** — bar chart comparing OK vs. NOK per product.
- **OK vs. NOK Distribution** — pie chart of overall quality split.
- **Production Trend by Date** — line chart showing OK/NOK over time (useful when no single date filter is applied).
- **Downtime by Reason Code** — bar chart of total downtime minutes per reason code.
- **NOK by Type** — pie chart breaking down defects by type (Scrap/Rework/Retest).

If no data matches your filters, you'll see an empty state message instead of blank charts.

---

## 9. Settings

Visible only to users with the **Admin** role. Accessible via the dropdown menu in the header.

### 9.1 User Management Tab

**Employee list:** Search by Employee ID or Name using the search box.

**To add a new Employee:**
1. Enter the numeric portion of the Employee ID (the `BR-` prefix is added automatically).
2. Enter the employee's **Name** (letters and spaces only).
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
1. Enter a **Role Name** (letters and spaces only).
2. Select one or more **Access Scope** (Dashboard, Master Data, Transactions, Production, Settings).
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
2. Enter a **New Password** (same rules as above: 8+ characters, 1 uppercase, 1 number).
3. Enter the same value again in **Confirm New Password**.
4. Click **Update Password**.

If your current password is wrong, or the new password doesn't meet the rules, or the confirmation doesn't match, you'll see an inline error.

---

## 10. Roles & Permissions

Access to each page is controlled per-Role via the **Access Scope** setting (Section 9.2). A user may hold multiple roles; their accessible pages are the union of all their roles' permissions.

| Page Key | Sidebar Page |
|---|---|
| `dashboard` | Dashboard |
| `master_data` | Master Data (both screens) |
| `transactions` | Manual Transaction |
| `production` | Production Dashboard |
| `settings` | Settings |

If you try to access a page you don't have permission for (e.g. by an old bookmark), you'll be automatically redirected to the first page you *do* have access to, or to the login screen if you have none.

---

