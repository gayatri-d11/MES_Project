from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import (
    TblEquipmentType, TblResourceType, TblFacility, TblWorkCenter,
    TblResource, TblEquipment, TblReasonType, TblReasonCode, TblProduct,
    TblShiftDefinition, TblShiftPlanning, TblRole, TblRolePermission,
    TblEmployee, TblEmployeeRole,
)


class Command(BaseCommand):
    help = 'Seeds the database with initial data and creates the default admin user.'

    def handle(self, *args, **kwargs):
        now = timezone.now()

        # 1. Equipment Type
        TblEquipmentType.objects.get_or_create(
            equipment_type=1,
            defaults={'text_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # 2. Resource Type
        TblResourceType.objects.get_or_create(
            resource_type=1,
            defaults={'text_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # 3. Plant
        TblFacility.objects.get_or_create(
            facility='Plant-A',
            defaults={'company': 'Brose', 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # 4. Work Centers
        for wc in ['WC-01', 'WC-02']:
            TblWorkCenter.objects.get_or_create(
                work_center=wc,
                defaults={'facility_id': 'Plant-A', 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 5. Workstations
        resource_type = TblResourceType.objects.get(resource_type=1)
        facility = TblFacility.objects.get(facility='Plant-A')
        wc01 = TblWorkCenter.objects.get(work_center='WC-01')
        wc02 = TblWorkCenter.objects.get(work_center='WC-02')
        workstations = [
            (1, 'WS-Assembly-01', wc01),
            (2, 'WS-Assembly-02', wc01),
            (3, 'WS-Testing-01',  wc02),
        ]
        for ws_id, ws_name, wc in workstations:
            TblResource.objects.get_or_create(
                id=ws_id,
                defaults={'resource_name': ws_name, 'facility': facility, 'work_center': wc, 'resource_type': resource_type, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 6. Machines
        equipment_type = TblEquipmentType.objects.get(equipment_type=1)
        machines = [
            (1, 'Module-A1', 1),
            (2, 'Module-A2', 1),
            (3, 'Module-T1', 3),
        ]
        for eq_id, eq_name, res_id in machines:
            TblEquipment.objects.get_or_create(
                id=eq_id,
                defaults={'equipment': eq_name, 'facility': facility, 'resource_id': res_id, 'equipment_type': equipment_type, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 7. Reason Types (fixed Brose standard codes — must never change)
        reason_types = [
            (1010, 'TO: Organizational Downtime',       'Machine Downtime'),
            (1011, 'TT: Technical Downtime',            'Machine Downtime'),
            (1012, 'TNB: Non Occupation Time',          'Machine Downtime'),
            (1013, 'TR: Change Overtime',               'Machine Downtime'),
            (1014, 'TW: Maintenance Cause Downtime',    'Machine Downtime'),
            (1015, 'TA: Short-term Lack of Job',        'Machine Downtime'),
            (1016, 'TN: Utilization Time (Running)',    'Machine Downtime'),
            (1017, 'TP: Performance Downtime',          'Machine Downtime'),
            (1018, 'TB: Utilization Time',              'Machine Downtime'),
            (23,   'Planned Downtime',                  'Machine Downtime'),
            (24,   'Unplanned Downtime',                'Machine Downtime'),
            (1001, 'Operator',                          'Scrap'),
            (1002, 'Material',                          'Scrap'),
            (30,   'Machine Failure',                   'Scrap'),
        ]
        for rt_id, rt_name, rt_cat in reason_types:
            TblReasonType.objects.get_or_create(
                id=rt_id,
                defaults={'reason_type': rt_name, 'reason_category': rt_cat, 'text_id': rt_id, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 8. Reason Codes (sample — users can add more)
        reason_codes = [
            ('MD-001',  'Conveyor Belt Failure',        'Machine Downtime', 'TT: Technical Downtime',         1011),
            ('MD-002',  'Sensor Malfunction',           'Machine Downtime', 'TT: Technical Downtime',         1011),
            ('NOK-001', 'Dimensional Out of Tolerance', 'Scrap',            'Machine Failure',                30),
            ('NOK-002', 'Surface Defect',               'Scrap',            'Operator',                       1001),
        ]
        for rc, desc, cat, rt_text, rt_id in reason_codes:
            TblReasonCode.objects.get_or_create(
                reason_code=rc,
                defaults={'description': desc, 'category': cat, 'reason_type_text': rt_text, 'reason_type_id': rt_id, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 9. Products
        products = [
            (1, 'PROD-001', 'Window Regulator LH', 'Serial', 0, 1),
            (2, 'PROD-002', 'Window Regulator RH', 'Serial', 0, 1),
            (3, 'PROD-003', 'Door Module Assembly', 'Batch', 1, 0),
        ]
        for p_id, p_no, desc, trace, lot, serial in products:
            TblProduct.objects.get_or_create(
                id=p_id,
                defaults={'product_no': p_no, 'description': desc, 'traceability': trace, 'lot_tracking_code': lot, 'serial_tracking_code': serial, 'fraction_allowed': 0, 'default_uom_code': 'EA', 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 10. Shift Definitions
        shifts = [
            (1, 'Morning Shift', '6:00 AM - 2:00 PM|10:00 AM - 10:15 AM'),
            (2, 'Evening Shift', '2:00 PM - 10:00 PM|6:00 PM - 6:15 PM'),
            (3, 'Night Shift',   '10:00 PM - 6:00 AM|2:00 AM - 2:15 AM'),
        ]
        for s_id, s_name, s_sched in shifts:
            TblShiftDefinition.objects.get_or_create(
                id=s_id,
                defaults={'shift_name': s_name, 'shift_start_time': now, 'shift_end_time': now, 'shift_sched': s_sched, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 11. Shift Planning
        planning = [
            (1, 1, 'WC-01'), (2, 2, 'WC-01'), (3, 3, 'WC-01'),
            (4, 1, 'WC-02'), (5, 2, 'WC-02'),
        ]
        for p_id, s_id, wc_name in planning:
            wc = TblWorkCenter.objects.get(work_center=wc_name)
            TblShiftPlanning.objects.get_or_create(
                id=p_id,
                defaults={'shift_id': s_id, 'work_center': wc, 'active': True, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # 12. Role
        role, _ = TblRole.objects.get_or_create(
            id=1,
            defaults={'role_name': 'Admin', 'text_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # 13. Role Permissions
        for page in ['dashboard', 'master_data', 'transactions', 'production', 'settings']:
            TblRolePermission.objects.get_or_create(role=role, page_key=page)

        # 14. Admin Employee
        from django.contrib.auth.hashers import make_password
        employee, created = TblEmployee.objects.get_or_create(
            id=1,
            defaults={
                'last_name': 'Admin User',
                'employee_no': 'BR-00000001',
                'pass_word': make_password('Admin@123'),
                'resource_id': 1,
                'employee_valid_date': now,
                'is_active': True,
                'rowversion_stamp': 1,
                'created_on': now,
                'modified_on': now,
            },
        )

        # 15. Employee Role
        TblEmployeeRole.objects.get_or_create(
            id=1,
            defaults={'employee': employee, 'role': role, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        self.stdout.write(self.style.SUCCESS('Setup complete.'))
        self.stdout.write(self.style.SUCCESS('Login: BR-00000001 / Admin@123'))
