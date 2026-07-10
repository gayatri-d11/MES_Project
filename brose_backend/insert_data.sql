-- ============================================================
-- Brose Platform - Direct DB Insert Script
-- Run with: psql -U postgres -d brose_db -f insert_data.sql
-- ============================================================

-- 1. Equipment Type
INSERT INTO tbl_equipment_type (equipment_type, text_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES (1, 1, true, 1, NOW(), NOW())
ON CONFLICT (equipment_type) DO NOTHING;

-- 2. Resource Type
INSERT INTO tbl_resource_type (resource_type, text_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES (1, 1, true, 1, NOW(), NOW())
ON CONFLICT (resource_type) DO NOTHING;

-- 3. Plant
INSERT INTO tbl_facility (facility, company, is_active, rowversion_stamp, created_on, modified_on)
VALUES ('Plant-A', 'Brose', true, 1, NOW(), NOW())
ON CONFLICT (facility) DO NOTHING;

-- 4. Work Centers
INSERT INTO tbl_work_center (work_center, facility, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  ('WC-01', 'Plant-A', true, 1, NOW(), NOW()),
  ('WC-02', 'Plant-A', true, 1, NOW(), NOW())
ON CONFLICT (work_center) DO NOTHING;

-- 5. Workstations (Resources)
INSERT INTO tbl_resource (id, resource_name, facility, work_center, resource_type, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 'WS-Assembly-01', 'Plant-A', 'WC-01', 1, true, 1, NOW(), NOW()),
  (2, 'WS-Assembly-02', 'Plant-A', 'WC-01', 1, true, 1, NOW(), NOW()),
  (3, 'WS-Testing-01',  'Plant-A', 'WC-02', 1, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Machines (Equipment)
INSERT INTO tbl_equipment (id, equipment, facility, resource_id, equipment_type, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 'Module-A1', 'Plant-A', 1, 1, true, 1, NOW(), NOW()),
  (2, 'Module-A2', 'Plant-A', 1, 1, true, 1, NOW(), NOW()),
  (3, 'Module-T1', 'Plant-A', 3, 1, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Reason Types
INSERT INTO tbl_reason_type (id, reason_type, reason_category, text_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 'Mechanical', 'Machine Downtime', 1, true, 1, NOW(), NOW()),
  (2, 'Quality',    'NOK',             2, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Reason Codes
INSERT INTO tbl_reason_code (reason_code, description, category, reason_type_text, reason_type_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  ('MD-001',  'Conveyor Belt Failure',        'Machine Downtime', 'Mechanical', 1, true, 1, NOW(), NOW()),
  ('MD-002',  'Sensor Malfunction',           'Machine Downtime', 'Mechanical', 1, true, 1, NOW(), NOW()),
  ('NOK-001', 'Dimensional Out of Tolerance', 'NOK',              'Quality',    2, true, 1, NOW(), NOW()),
  ('NOK-002', 'Surface Defect',               'NOK',              'Quality',    2, true, 1, NOW(), NOW())
ON CONFLICT (reason_code) DO NOTHING;

-- 9. Products (Variants)
INSERT INTO tbl_product (id, product_no, description, traceability, lot_tracking_code, serial_tracking_code, fraction_allowed, default_uom_code, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 'PROD-001', 'Window Regulator LH', 'Serial', 0, 1, 0, 'EA', true, 1, NOW(), NOW()),
  (2, 'PROD-002', 'Window Regulator RH', 'Serial', 0, 1, 0, 'EA', true, 1, NOW(), NOW()),
  (3, 'PROD-003', 'Door Module Assembly','Batch',  1, 0, 0, 'EA', true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Shift Definitions
INSERT INTO tbl_shift_definition (id, shift_name, shift_start_time, shift_end_time, shift_sched, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 'Morning Shift', NOW(), NOW(), '6:00 AM - 2:00 PM|10:00 AM - 10:15 AM',   true, 1, NOW(), NOW()),
  (2, 'Evening Shift', NOW(), NOW(), '2:00 PM - 10:00 PM|6:00 PM - 6:15 PM',    true, 1, NOW(), NOW()),
  (3, 'Night Shift',   NOW(), NOW(), '10:00 PM - 6:00 AM|2:00 AM - 2:15 AM',    true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Shift Planning
INSERT INTO tbl_shift_planning (id, shift_id, work_center, active, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  (1, 1, 'WC-01', true, true, 1, NOW(), NOW()),
  (2, 2, 'WC-01', true, true, 1, NOW(), NOW()),
  (3, 3, 'WC-01', true, true, 1, NOW(), NOW()),
  (4, 1, 'WC-02', true, true, 1, NOW(), NOW()),
  (5, 2, 'WC-02', true, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 12. Role
INSERT INTO tbl_role (id, role_name, text_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES (1, 'Admin', 1, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 13. Role Permissions
INSERT INTO tbl_role_permission (role_id, page_key)
VALUES
  (1, 'dashboard'),
  (1, 'master_data'),
  (1, 'transactions'),
  (1, 'production'),
  (1, 'settings')
ON CONFLICT (role_id, page_key) DO NOTHING;

-- 14. Employee (password = Admin@123, bcrypt hashed)
INSERT INTO tbl_employee (id, last_name, employee_no, pass_word, resource_id, employee_valid_date, is_active, rowversion_stamp, created_on, modified_on)
VALUES (
  1,
  'Admin User',
  'BR-00000001',
  'pbkdf2_sha256$600000$HawojKPOqAscuF4nQ1HUAw$dMsWqzUOZ/pSRCLPIaVp4fCyd9bIhkXQFQuxWLy2YRw=',
  1,
  NOW(),
  true, 1, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 15. Employee Role
INSERT INTO tbl_employee_role (id, employee_id, role_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES (1, 1, 1, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
