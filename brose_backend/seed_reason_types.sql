-- Seed script for tbl_reason_type
-- Run once on the database: psql -U <user> -d brose_db -f seed_reason_types.sql

INSERT INTO tbl_reason_type (id, reason_type, reason_category, text_id, is_active, rowversion_stamp, created_on, modified_on)
VALUES
  -- Machine Downtime
  (1010, 'TO: Organizational Downtime',         'Machine Downtime', 1010, true, 1, NOW(), NOW()),
  (1011, 'TT: Technical Downtime',              'Machine Downtime', 1011, true, 1, NOW(), NOW()),
  (1012, 'TNB: Non Occupation Time',            'Machine Downtime', 1012, true, 1, NOW(), NOW()),
  (1013, 'TR: Change Overtime',                 'Machine Downtime', 1013, true, 1, NOW(), NOW()),
  (1014, 'TW: Maintenance Cause Downtime',      'Machine Downtime', 1014, true, 1, NOW(), NOW()),
  (1015, 'TA: Short-term Lack of Job',          'Machine Downtime', 1015, true, 1, NOW(), NOW()),
  (1016, 'TN: Utilization Time (Running)',      'Machine Downtime', 1016, true, 1, NOW(), NOW()),
  (1017, 'TP: Performance Downtime',            'Machine Downtime', 1017, true, 1, NOW(), NOW()),
  (1018, 'TB: Utilization Time',                'Machine Downtime', 1018, true, 1, NOW(), NOW()),
  (23,   'Planned Downtime',                    'Machine Downtime', 23,   true, 1, NOW(), NOW()),
  (24,   'Unplanned Downtime',                  'Machine Downtime', 24,   true, 1, NOW(), NOW()),
  -- Scrap
  (1001, 'Operator',                            'Scrap',            1001, true, 1, NOW(), NOW()),
  (1002, 'Material',                            'Scrap',            1002, true, 1, NOW(), NOW()),
  (30,   'Machine Failure',                     'Scrap',            30,   true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
