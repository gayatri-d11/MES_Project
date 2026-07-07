from rest_framework import serializers
from .models import TblEmployee, TblEmployeeRole, TblRole, TblFacility, TblWorkCenter, TblResource, TblEquipment, TblReasonCode, TblReasonType, TblProduct, TblShiftDefinition, TblShiftPlanning
import re

class ShiftPlanningSerializer(serializers.ModelSerializer):
    shift_name = serializers.CharField(source='shift.shift_name', read_only=True)
    work_center_name = serializers.CharField(source='work_center.work_center', read_only=True)

    class Meta:
        model = TblShiftPlanning
        fields = ['id', 'shift_name', 'work_center_name', 'active', 'is_active']

class ShiftSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    break_time = serializers.SerializerMethodField()

    class Meta:
        model = TblShiftDefinition
        fields = ['id', 'shift_name', 'duration', 'break_time', 'is_active']

    def get_duration(self, obj):
        parts = (obj.shift_sched or '').split('|')
        return parts[0] if parts else ''

    def get_break_time(self, obj):
        parts = (obj.shift_sched or '').split('|')
        return parts[1] if len(parts) > 1 else ''

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblProduct
        fields = ['id', 'product_no', 'description', 'traceability', 'is_active']

class ReasonTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblReasonType
        fields = ['id', 'reason_type', 'reason_category']

class ReasonCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblReasonCode
        fields = ['reason_code', 'description', 'category', 'reason_type_text']

class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblFacility
        fields = ['facility']

class WorkCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblWorkCenter
        fields = ['work_center', 'facility']

class WorkstationSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='facility.facility', read_only=True)
    work_center_name = serializers.CharField(source='work_center.work_center', read_only=True)

    class Meta:
        model = TblResource
        fields = ['id', 'resource_name', 'work_center_name', 'facility_name']

class MachineSerializer(serializers.ModelSerializer):
    workstation_name = serializers.CharField(source='resource.resource_name', read_only=True)
    work_center_name = serializers.CharField(source='resource.work_center.work_center', read_only=True)
    facility_name = serializers.CharField(source='resource.facility.facility', read_only=True)

    class Meta:
        model = TblEquipment
        fields = ['id', 'equipment', 'workstation_name', 'work_center_name', 'facility_name', 'is_active']

class LoginSerializer(serializers.Serializer):
    employee_no = serializers.CharField()
    password = serializers.CharField()

class RoleSerializer(serializers.ModelSerializer):
    pages = serializers.SerializerMethodField()

    class Meta:
        model = TblRole
        fields = ['id', 'role_name', 'pages']

    def get_pages(self, obj):
        from .models import TblRolePermission
        return list(TblRolePermission.objects.filter(role=obj).values_list('page_key', flat=True))


class EmployeeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = TblEmployee
        fields = ['id', 'employee_no', 'last_name', 'employee_valid_date', 'is_active', 'role']

    def get_role(self, obj):
        roles = TblEmployeeRole.objects.filter(employee=obj).select_related('role')
        return [er.role.role_name for er in roles]


class CreateEmployeeSerializer(serializers.Serializer):
    employee_no = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField()
    role_ids = serializers.ListField(child=serializers.IntegerField())
    employee_valid_date = serializers.DateTimeField()

    def validate_employee_no(self, value):
        if not re.match(r'^BR-\d{8}$', value):
            raise serializers.ValidationError('Employee ID must be in format BR-00000001')
        return value

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Employee name is required')
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError('Employee name cannot contain special characters or numbers')
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters')
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError('Password must contain at least 1 uppercase letter')
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError('Password must contain at least 1 number')
        return value

    def validate_role_ids(self, value):
        if not value:
            raise serializers.ValidationError('Please assign at least one role')
        return value

