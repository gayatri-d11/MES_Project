from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from core.models import (
    TblEquipmentType, TblResourceType, TblFacility, TblWorkCenter,
    TblResource, TblReasonType, TblReasonCode,
    TblRole, TblRolePermission, TblEmployee, TblEmployeeRole,
)


class Command(BaseCommand):
    help = 'Seeds base data: Plant-A, reason codes, roles, and admin user.'

    def handle(self, *args, **kwargs):
        now = timezone.now()

        # Required internal types
        TblEquipmentType.objects.get_or_create(
            equipment_type=1,
            defaults={'text_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )
        TblResourceType.objects.get_or_create(
            resource_type=1,
            defaults={'text_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # Plant-A — all other plants added via UI
        TblFacility.objects.get_or_create(
            facility='Plant-A',
            defaults={'company': 'Brose', 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        # Admin-Resource workstation (required for admin employee FK)
        resource_type = TblResourceType.objects.get(resource_type=1)
        facility_a = TblFacility.objects.get(facility='Plant-A')
        wc_placeholder, _ = TblWorkCenter.objects.get_or_create(
            work_center='WCA-01',
            defaults={'facility_id': 'Plant-A', 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )
        TblResource.objects.get_or_create(
            id=1,
            defaults={
                'resource_name': 'Admin-Resource', 'facility': facility_a,
                'work_center': wc_placeholder, 'resource_type': resource_type,
                'is_active': False, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now,
            },
        )

        # Reason Types
        reason_types = [
            (1010, 'TO: Organizational Downtime',    'Machine Downtime'),
            (1011, 'TT: Technical Downtime',         'Machine Downtime'),
            (1012, 'TNB: Non Occupation Time',       'Machine Downtime'),
            (1013, 'TR: Change Overtime',            'Machine Downtime'),
            (1014, 'TW: Maintenance Cause Downtime', 'Machine Downtime'),
            (1015, 'TA: Short-term Lack of Job',     'Machine Downtime'),
            (1016, 'TN: Utilization Time (Running)', 'Machine Downtime'),
            (1017, 'TP: Performance Downtime',       'Machine Downtime'),
            (1018, 'TB: Utilization Time',           'Machine Downtime'),
            (23,   'Planned Downtime',               'Machine Downtime'),
            (24,   'Unplanned Downtime',             'Machine Downtime'),
            (1001, 'Operator',                       'Scrap'),
            (30,   'Machine Failure',                'Scrap'),
        ]
        for rt_id, rt_name, rt_cat in reason_types:
            TblReasonType.objects.get_or_create(
                id=rt_id,
                defaults={'reason_type': rt_name, 'reason_category': rt_cat, 'text_id': rt_id, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # Reason Codes
        reason_codes = [
            ('TO',     'TO: Organizational Downtime',    'Machine Downtime', 1010),
            ('TT',     'TT: Technical Downtime',         'Machine Downtime', 1011),
            ('TNB',    'TNB: Non Occupation Time',       'Machine Downtime', 1012),
            ('TR',     'TR: Change Overtime',            'Machine Downtime', 1013),
            ('TW',     'TW: Maintenance Cause Downtime', 'Machine Downtime', 1014),
            ('TA',     'TA: Short-term Lack of Job',     'Machine Downtime', 1015),
            ('TN',     'TN: Utilization Time (Running)', 'Machine Downtime', 1016),
            ('TP',     'TP: Performance Downtime',       'Machine Downtime', 1017),
            ('TB',     'TB: Utilization Time',           'Machine Downtime', 1018),
            ('PD',     'Planned Downtime',               'Machine Downtime', 23),
            ('UD',     'Unplanned Downtime',             'Machine Downtime', 24),
            ('SC-OP',  'Operator',                       'Scrap',            1001),
            ('SC-MF',  'Machine Failure',                'Scrap',            30),
            ('NOK-SC', 'Scrap',                          'NOK',              None),
            ('NOK-RW', 'Rework',                         'NOK',              None),
            ('NOK-RT', 'Retest',                         'NOK',              None),
        ]
        for rc, desc, cat, rt_id in reason_codes:
            TblReasonCode.objects.get_or_create(
                reason_code=rc,
                defaults={
                    'description': desc, 'category': cat,
                    'reason_type_text': desc, 'reason_type_id': rt_id,
                    'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now,
                },
            )

        # Roles
        roles = [
            (1, 'Admin'),
            (2, 'Manager'),
            (3, 'Supervisor'),
            (4, 'Operator'),
        ]
        for r_id, r_name in roles:
            TblRole.objects.get_or_create(
                id=r_id,
                defaults={'role_name': r_name, 'text_id': r_id, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
            )

        # Role Permissions
        role_permissions = [
            (1, ['dashboard', 'master_data', 'transactions', 'production', 'settings']),
            (2, ['dashboard', 'production']),
            (3, ['dashboard', 'transactions', 'master_data']),
            (4, ['dashboard', 'transactions']),
        ]
        for r_id, pages in role_permissions:
            try:
                role = TblRole.objects.get(id=r_id)
            except TblRole.DoesNotExist:
                continue
            for page in pages:
                TblRolePermission.objects.get_or_create(role=role, page_key=page)

        # Admin Employee
        admin, _ = TblEmployee.objects.get_or_create(
            id=1,
            defaults={
                'last_name': 'Admin',
                'employee_no': 'BR-00000001',
                'pass_word': make_password('Admin@123'),
                'resource_id': 1,
                'employee_valid_date': now,
                'is_active': True,
                'rowversion_stamp': 1, 'created_on': now, 'modified_on': now,
            },
        )
        TblEmployeeRole.objects.get_or_create(
            id=1,
            defaults={'employee': admin, 'role_id': 1, 'is_active': True, 'rowversion_stamp': 1, 'created_on': now, 'modified_on': now},
        )

        self.stdout.write(self.style.SUCCESS('Setup complete.'))
        self.stdout.write(self.style.SUCCESS('Default login: BR-00000001 — see SETUP.md for password.'))
