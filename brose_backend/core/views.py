import re
from django.db import models as django_models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TblEmployee, TblEmployeeRole, TblRole, TblResource, TblRolePermission, TblFacility, TblWorkCenter, TblEquipment, TblResourceType, TblEquipmentType, TblReasonCode, TblReasonType, TblProduct, TblShiftDefinition, TblShiftPlanning, TblResourceLabour, TblResourceLabourDetailModuleDowntime, TblResourceLabourDetailModule, TblResourceLabourDetailWorkstation, TblProduction, TblNokProduction, TblParent, TblCustComplaint
from .serializers import LoginSerializer, EmployeeSerializer, CreateEmployeeSerializer, RoleSerializer, PlantSerializer, WorkCenterSerializer, WorkstationSerializer, MachineSerializer, ReasonCodeSerializer, ReasonTypeSerializer, ProductSerializer, ShiftSerializer, ShiftPlanningSerializer
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

NAME_RE = re.compile(r'^[a-zA-Z0-9\s\-_]+$')


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        employee_no = serializer.validated_data['employee_no']
        password = serializer.validated_data['password']

        try:
            employee = TblEmployee.objects.get(employee_no=employee_no)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not employee.is_active:
            return Response({'error': 'Your account has been deactivated. Please contact your administrator.'}, status=status.HTTP_403_FORBIDDEN)

        if not check_password(password, employee.pass_word):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        role_names = list(
            TblEmployeeRole.objects.filter(employee=employee)
            .select_related('role')
            .values_list('role__role_name', flat=True)
        ) or ['Operator']

        role_ids = TblEmployeeRole.objects.filter(employee=employee).values_list('role_id', flat=True)
        pages = list(TblRolePermission.objects.filter(role_id__in=role_ids).values_list('page_key', flat=True).distinct())

        refresh = RefreshToken()
        refresh['employee_no'] = employee_no
        refresh['roles'] = list(role_names)
        refresh['pages'] = pages

        return Response({
           'access': str(refresh.access_token),
           'refresh': str(refresh),
           'employee_no': employee_no,
           'roles': role_names,
           'pages': pages,
        })


class EmployeeListView(APIView):

    def get(self, request):
        employees = TblEmployee.objects.all().order_by('-is_active', 'employee_no')
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if TblEmployee.objects.filter(employee_no=data['employee_no']).exists():
            return Response({'error': 'Employee ID already exists'}, status=status.HTTP_400_BAD_REQUEST)

        employee = TblEmployee.objects.create(
            id=(TblEmployee.objects.order_by('-id').first().id + 1) if TblEmployee.objects.exists() else 1,
            employee_no=data['employee_no'],
            last_name=data['last_name'],
            pass_word=make_password(data['password']),
            resource_id=1,
            employee_valid_date=data['employee_valid_date'],
        )

        for role_id in data['role_ids']:
            TblEmployeeRole.objects.create(
                id=(TblEmployeeRole.objects.order_by('-id').first().id + 1) if TblEmployeeRole.objects.exists() else 1,
                employee=employee,
                role_id=role_id,
            )

        return Response({'message': 'Employee created successfully'}, status=status.HTTP_201_CREATED)


class RoleListView(APIView):

    def get(self, request):
        roles = TblRole.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

    def post(self, request):
        role_name = request.data.get('role_name', '').strip()
        pages = request.data.get('pages', [])

        if not role_name:
            return Response({'error': 'Role name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not pages:
            return Response({'error': 'Please select at least one page'}, status=status.HTTP_400_BAD_REQUEST)
        if TblRole.objects.filter(role_name=role_name).exists():
            return Response({'error': 'Role already exists'}, status=status.HTTP_400_BAD_REQUEST)

        new_id = (TblRole.objects.order_by('-id').first().id + 1) if TblRole.objects.exists() else 1
        role = TblRole.objects.create(id=new_id, role_name=role_name, text_id=new_id)

        for page in pages:
            TblRolePermission.objects.create(role=role, page_key=page)

        return Response({'message': 'Role created successfully'}, status=status.HTTP_201_CREATED)


class RoleDetailView(APIView):

    def patch(self, request, role_id):
        try:
            role = TblRole.objects.get(id=role_id)
        except TblRole.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

        role_name = request.data.get('role_name', '').strip()
        pages = request.data.get('pages', [])

        if not role_name:
            return Response({'error': 'Role name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not pages:
            return Response({'error': 'Please select at least one page'}, status=status.HTTP_400_BAD_REQUEST)
        if TblRole.objects.filter(role_name=role_name).exclude(id=role_id).exists():
            return Response({'error': 'Role name already exists'}, status=status.HTTP_400_BAD_REQUEST)

        role.role_name = role_name
        role.save()

        TblRolePermission.objects.filter(role=role).delete()
        for page in pages:
            TblRolePermission.objects.create(role=role, page_key=page)

        return Response({'message': 'Role updated successfully'})

    def delete(self, request, role_id):
        try:
            role = TblRole.objects.get(id=role_id)
        except TblRole.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

        if TblEmployeeRole.objects.filter(role=role).exists():
            count = TblEmployeeRole.objects.filter(role=role).count()
            return Response(
                {'error': f'Cannot delete — {count} employee(s) are still assigned to this role. Reassign them first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        TblRolePermission.objects.filter(role=role).delete()
        role.delete()
        return Response({'message': 'Role deleted successfully'})


class EmployeeDetailView(APIView):

    def patch(self, request, employee_id):
        try:
            employee = TblEmployee.objects.get(id=employee_id)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        if 'last_name' in data:
            employee.last_name = data['last_name']

        if 'password' in data and data['password']:
            employee.pass_word = make_password(data['password'])

        if 'role_ids' in data:
            TblEmployeeRole.objects.filter(employee=employee).delete()
            for role_id in data['role_ids']:
                TblEmployeeRole.objects.create(
                    id=(TblEmployeeRole.objects.order_by('-id').first().id + 1) if TblEmployeeRole.objects.exists() else 1,
                    employee=employee,
                    role_id=role_id,
                )

        employee.save()
        return Response({'message': 'Employee updated successfully'})

    def delete(self, request, employee_id):
        try:
            employee = TblEmployee.objects.get(id=employee_id)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        employee.is_active = False
        employee.save()
        return Response({'message': 'Employee deactivated successfully'})

    def post(self, request, employee_id):
        try:
            employee = TblEmployee.objects.get(id=employee_id)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        employee.is_active = True
        employee.save()
        return Response({'message': 'Employee activated successfully'})


class PlantListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        if request.query_params.get('all') == 'true':
            plants = TblFacility.objects.all()
        else:
            plants = TblFacility.objects.filter(is_active=True)
        return Response(PlantSerializer(plants, many=True).data)

    def post(self, request):
        # Guard: if new_facility is present, this is a rename — reject to avoid accidental create
        if request.data.get('new_facility'):
            return Response({'error': 'Use PATCH to rename.'}, status=status.HTTP_400_BAD_REQUEST)
        name = request.data.get('facility', '').strip()
        if not name:
            return Response({'error': 'Plant name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(name):
            return Response({'error': 'Plant name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblFacility.objects.filter(facility=name).exists():
            return Response({'error': 'Plant already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        TblFacility.objects.create(facility=name)
        return Response({'message': 'Plant created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        name = request.data.get('facility', '').strip()
        if request.data.get('new_facility'):
            # rename logic
            old_name = name
            new_name = request.data.get('new_facility', '').strip()
            if not new_name: return Response({'error': 'New plant name is required.'}, status=status.HTTP_400_BAD_REQUEST)
            if not NAME_RE.match(new_name): return Response({'error': 'Plant name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
            if TblFacility.objects.filter(facility=new_name).exists(): return Response({'error': 'Plant name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                plant = TblFacility.objects.get(facility=old_name)
            except TblFacility.DoesNotExist:
                return Response({'error': 'Plant not found.'}, status=status.HTTP_404_NOT_FOUND)
            plant.facility = new_name
            plant.save()
            return Response({'message': 'Plant renamed successfully.'})
        # toggle active
        try:
            plant = TblFacility.objects.get(facility=name)
        except TblFacility.DoesNotExist:
            return Response({'error': 'Plant not found.'}, status=status.HTTP_404_NOT_FOUND)
        if plant.is_active:
            # Deactivate cascade: WC → WS → Machines
            wcs = TblWorkCenter.objects.filter(facility=plant, is_active=True)
            for wc in wcs:
                ws_list = TblResource.objects.filter(work_center=wc, is_active=True)
                for ws in ws_list:
                    TblEquipment.objects.filter(resource=ws, is_active=True).update(is_active=False)
                ws_list.update(is_active=False)
            wcs.update(is_active=False)
            plant.is_active = False
            plant.save()
            return Response({'message': 'Plant and all related Work Centers, Workstations, and Machines deactivated successfully.'})
        else:
            plant.is_active = True
            plant.save()
            return Response({'message': 'Plant activated successfully.'})

    def delete(self, request):
        name = request.data.get('facility', '').strip()
        try:
            plant = TblFacility.objects.get(facility=name)
        except TblFacility.DoesNotExist:
            return Response({'error': 'Plant not found.'}, status=status.HTTP_404_NOT_FOUND)
        if TblWorkCenter.objects.filter(facility=plant, is_active=True).exists():
            return Response({'error': 'Cannot delete — this Plant has Work Centers assigned to it.'}, status=status.HTTP_400_BAD_REQUEST)
        plant.is_active = False
        plant.save()
        return Response({'message': 'Plant deleted successfully.'})


class WorkCenterListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        if request.query_params.get('all') == 'true':
            wcs = TblWorkCenter.objects.all().select_related('facility')
        else:
            wcs = TblWorkCenter.objects.filter(is_active=True).select_related('facility')
        return Response(WorkCenterSerializer(wcs, many=True).data)

    def post(self, request):
        name = request.data.get('work_center', '').strip()
        facility_name = request.data.get('facility', '').strip()
        if not name:
            return Response({'error': 'Work Center name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(name):
            return Response({'error': 'Work Center name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not facility_name:
            return Response({'error': 'Please select a Plant.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblWorkCenter.objects.filter(work_center=name).exists():
            return Response({'error': 'Work Center already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            facility = TblFacility.objects.get(facility=facility_name)
        except TblFacility.DoesNotExist:
            return Response({'error': 'Plant not found.'}, status=status.HTTP_400_BAD_REQUEST)
        TblWorkCenter.objects.create(work_center=name, facility=facility)
        return Response({'message': 'Work Center created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        name = request.data.get('work_center', '').strip()
        if request.data.get('new_work_center'):
            new_name = request.data.get('new_work_center', '').strip()
            if not NAME_RE.match(new_name): return Response({'error': 'Work Center name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
            if TblWorkCenter.objects.filter(work_center=new_name).exists(): return Response({'error': 'Work Center name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                wc = TblWorkCenter.objects.get(work_center=name)
            except TblWorkCenter.DoesNotExist:
                return Response({'error': 'Work Center not found.'}, status=status.HTTP_404_NOT_FOUND)
            wc.work_center = new_name
            wc.save()
            return Response({'message': 'Work Center renamed successfully.'})
        try:
            wc = TblWorkCenter.objects.get(work_center=name)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Center not found.'}, status=status.HTTP_404_NOT_FOUND)
        if wc.is_active:
            # Deactivate cascade: WS → Machines
            ws_list = TblResource.objects.filter(work_center=wc, is_active=True)
            for ws in ws_list:
                TblEquipment.objects.filter(resource=ws, is_active=True).update(is_active=False)
            ws_list.update(is_active=False)
            wc.is_active = False
            wc.save()
            return Response({'message': 'Work Center and all related Workstations and Machines deactivated successfully.'})
        else:
            wc.is_active = True
            wc.save()
            return Response({'message': 'Work Center activated successfully.'})

    def delete(self, request):
        name = request.data.get('work_center', '').strip()
        try:
            wc = TblWorkCenter.objects.get(work_center=name)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Center not found.'}, status=status.HTTP_404_NOT_FOUND)
        if TblResource.objects.filter(work_center=wc, is_active=True).exists():
            return Response({'error': 'Cannot delete — this Work Center has Workstations assigned to it.'}, status=status.HTTP_400_BAD_REQUEST)
        wc.is_active = False
        wc.save()
        return Response({'message': 'Work Center deleted successfully.'})


class WorkstationListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        if request.query_params.get('all') == 'true':
            ws = TblResource.objects.all().select_related('work_center', 'facility')
        else:
            ws = TblResource.objects.filter(is_active=True).select_related('work_center', 'facility')
        return Response(WorkstationSerializer(ws, many=True).data)

    def post(self, request):
        name = request.data.get('resource_name', '').strip()
        work_center_name = request.data.get('work_center', '').strip()
        if not name:
            return Response({'error': 'Workstation name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(name):
            return Response({'error': 'Workstation name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not work_center_name:
            return Response({'error': 'Please select a Work Center.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblResource.objects.filter(resource_name=name).exists():
            return Response({'error': 'Workstation already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            work_center = TblWorkCenter.objects.get(work_center=work_center_name)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Center not found.'}, status=status.HTTP_400_BAD_REQUEST)
        resource_type = TblResourceType.objects.first()
        if not resource_type:
            return Response({'error': 'No resource type configured. Please seed resource types first.'}, status=status.HTTP_400_BAD_REQUEST)
        new_id = (TblResource.objects.order_by('-id').first().id + 1) if TblResource.objects.exists() else 1
        TblResource.objects.create(
            id=new_id, resource_name=name,
            facility=work_center.facility, work_center=work_center,
            resource_type=resource_type,
        )
        return Response({'message': 'Workstation created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        resource_id = request.data.get('id')
        if request.data.get('new_resource_name'):
            new_name = request.data.get('new_resource_name', '').strip()
            if not NAME_RE.match(new_name): return Response({'error': 'Workstation name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
            if TblResource.objects.filter(resource_name=new_name).exists(): return Response({'error': 'Workstation name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                ws = TblResource.objects.get(id=resource_id)
            except TblResource.DoesNotExist:
                return Response({'error': 'Workstation not found.'}, status=status.HTTP_404_NOT_FOUND)
            ws.resource_name = new_name
            ws.save()
            return Response({'message': 'Workstation renamed successfully.'})
        try:
            ws = TblResource.objects.get(id=resource_id)
        except TblResource.DoesNotExist:
            return Response({'error': 'Workstation not found.'}, status=status.HTTP_404_NOT_FOUND)
        ws.is_active = not ws.is_active
        ws.save()
        state = 'activated' if ws.is_active else 'deactivated'
        return Response({'message': f'Workstation {state} successfully.'})

    def delete(self, request):
        resource_id = request.data.get('id')
        try:
            ws = TblResource.objects.get(id=resource_id)
        except TblResource.DoesNotExist:
            return Response({'error': 'Workstation not found.'}, status=status.HTTP_404_NOT_FOUND)
        if TblEquipment.objects.filter(resource=ws, is_active=True).exists():
            return Response({'error': 'Cannot delete — this Workstation has Machines assigned to it.'}, status=status.HTTP_400_BAD_REQUEST)
        ws.is_active = False
        ws.save()
        return Response({'message': 'Workstation deleted successfully.'})


class MachineListView(APIView):

    def get(self, request):
        if request.query_params.get('all') == 'true':
            machines = TblEquipment.objects.all().select_related('resource', 'resource__work_center', 'resource__facility')
        else:
            machines = TblEquipment.objects.filter(is_active=True).select_related('resource', 'resource__work_center', 'resource__facility')
        return Response(MachineSerializer(machines, many=True).data)

    def post(self, request):
        name = request.data.get('equipment', '').strip()
        resource_id = request.data.get('resource_id')
        if not name:
            return Response({'error': 'Machine name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(name):
            return Response({'error': 'Machine name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not resource_id:
            return Response({'error': 'Please select a Workstation.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblEquipment.objects.filter(equipment=name).exists():
            return Response({'error': 'Machine already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            resource = TblResource.objects.get(id=resource_id)
        except TblResource.DoesNotExist:
            return Response({'error': 'Workstation not found.'}, status=status.HTTP_400_BAD_REQUEST)
        equipment_type = TblEquipmentType.objects.first()
        if not equipment_type:
            return Response({'error': 'No equipment type configured. Please seed equipment types first.'}, status=status.HTTP_400_BAD_REQUEST)
        new_id = (TblEquipment.objects.order_by('-id').first().id + 1) if TblEquipment.objects.exists() else 1
        TblEquipment.objects.create(
            id=new_id, equipment=name,
            facility=resource.facility, resource=resource,
            equipment_type=equipment_type,
        )
        return Response({'message': 'Machine created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        machine_id = request.data.get('id')
        try:
            machine = TblEquipment.objects.get(id=machine_id)
        except TblEquipment.DoesNotExist:
            return Response({'error': 'Machine not found.'}, status=status.HTTP_404_NOT_FOUND)
        machine.is_active = not machine.is_active
        machine.save()
        state = 'activated' if machine.is_active else 'deactivated'
        return Response({'message': f'Machine {state} successfully.'})

    def delete(self, request):
        machine_id = request.data.get('id')
        try:
            machine = TblEquipment.objects.get(id=machine_id)
        except TblEquipment.DoesNotExist:
            return Response({'error': 'Machine not found.'}, status=status.HTTP_404_NOT_FOUND)
        machine.is_active = False
        machine.save()
        return Response({'message': 'Machine deactivated successfully.'})


class ReasonTypeListView(APIView):

    def get(self, request):
        return Response(ReasonTypeSerializer(TblReasonType.objects.filter(is_active=True), many=True).data)


class ReasonCodeListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        codes = TblReasonCode.objects.filter(is_active=True).select_related('reason_type')
        return Response(ReasonCodeSerializer(codes, many=True).data)

    def patch(self, request):
        reason_code = request.data.get('reason_code', '').strip()
        try:
            rc = TblReasonCode.objects.get(reason_code=reason_code)
        except TblReasonCode.DoesNotExist:
            return Response({'error': 'Reason Code not found.'}, status=status.HTTP_404_NOT_FOUND)
        description = request.data.get('description', '').strip()
        category = request.data.get('category', '').strip()
        reason_type_text = request.data.get('reason_type_text', '').strip()
        reason_type_id = request.data.get('reason_type_id')
        if not description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not category:
            return Response({'error': 'Category is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not reason_type_text:
            return Response({'error': 'Reason Type is required.'}, status=status.HTTP_400_BAD_REQUEST)
        rc.description = description
        rc.category = category
        rc.reason_type_text = reason_type_text
        if reason_type_id:
            try:
                rc.reason_type = TblReasonType.objects.get(id=reason_type_id)
            except TblReasonType.DoesNotExist:
                pass
        rc.save()
        return Response({'message': 'Reason Code updated successfully.'})

    def post(self, request):
        reason_code = request.data.get('reason_code', '').strip()
        description = request.data.get('description', '').strip()
        category = request.data.get('category', '').strip()
        reason_type_text = request.data.get('reason_type_text', '').strip()
        reason_type_id = request.data.get('reason_type_id')

        if not reason_code:
            return Response({'error': 'Reason Code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.match(r'^[a-zA-Z0-9\-_]+$', reason_code):
            return Response({'error': 'Reason Code can only contain letters, numbers, hyphens and underscores.'}, status=status.HTTP_400_BAD_REQUEST)
        if not description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', description):
            return Response({'error': 'Description cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not category:
            return Response({'error': 'Category is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', category):
            return Response({'error': 'Category cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not reason_type_text:
            return Response({'error': 'Reason Type is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.match(r'^[a-zA-Z0-9\s\-_:]+$', reason_type_text):
            return Response({'error': 'Reason Type cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblReasonCode.objects.filter(reason_code=reason_code).exists():
            return Response({'error': 'Reason Code already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        reason_type = None
        if reason_type_id:
            try:
                reason_type = TblReasonType.objects.get(id=reason_type_id)
            except TblReasonType.DoesNotExist:
                pass

        TblReasonCode.objects.create(
            reason_code=reason_code,
            description=description,
            category=category,
            reason_type_text=reason_type_text,
            reason_type=reason_type,
        )
        return Response({'message': 'Reason Code created successfully.'}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        reason_code = request.data.get('reason_code', '').strip()
        try:
            rc = TblReasonCode.objects.get(reason_code=reason_code)
        except TblReasonCode.DoesNotExist:
            return Response({'error': 'Reason Code not found.'}, status=status.HTTP_404_NOT_FOUND)
        rc.is_active = False
        rc.save()
        return Response({'message': 'Reason Code deleted successfully.'})


class ShiftListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        if request.query_params.get('all') == 'true':
            shifts = TblShiftDefinition.objects.all().order_by('shift_name')
        else:
            shifts = TblShiftDefinition.objects.filter(is_active=True).order_by('shift_name')
        return Response(ShiftSerializer(shifts, many=True).data)

    def post(self, request):
        shift_name = request.data.get('shift_name', '').strip()
        duration = request.data.get('duration', '').strip()
        break_time = request.data.get('break_time', '').strip()

        if not shift_name:
            return Response({'error': 'Shift Name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(shift_name):
            return Response({'error': 'Shift Name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not duration:
            return Response({'error': 'Shift Duration is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblShiftDefinition.objects.filter(shift_name=shift_name, is_active=True).exists():
            return Response({'error': 'Shift Name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        new_id = (TblShiftDefinition.objects.order_by('-id').first().id + 1) if TblShiftDefinition.objects.exists() else 1
        now = timezone.now()
        TblShiftDefinition.objects.create(
            id=new_id,
            shift_name=shift_name,
            shift_start_time=now,
            shift_end_time=now,
            shift_sched=f'{duration}|{break_time}',
        )
        return Response({'message': 'Shift created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        shift_id = request.data.get('id')
        try:
            shift = TblShiftDefinition.objects.get(id=shift_id)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Edit mode — if duration sent, update fields
        if 'duration' in request.data:
            shift_name = request.data.get('shift_name', '').strip()
            duration = request.data.get('duration', '').strip()
            break_time = request.data.get('break_time', '').strip()
            if not shift_name:
                return Response({'error': 'Shift Name is required.'}, status=status.HTTP_400_BAD_REQUEST)
            if not duration:
                return Response({'error': 'Shift Duration is required.'}, status=status.HTTP_400_BAD_REQUEST)
            if TblShiftDefinition.objects.filter(shift_name=shift_name).exclude(id=shift_id).exists():
                return Response({'error': 'Shift Name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            shift.shift_name = shift_name
            shift.shift_sched = f'{duration}|{break_time}'
            shift.save()
            return Response({'message': 'Shift updated successfully.'})
        # Toggle active
        shift.is_active = not shift.is_active
        shift.save()
        state = 'activated' if shift.is_active else 'deactivated'
        return Response({'message': f'Shift {state} successfully.'})

    def delete(self, request):
        shift_id = request.data.get('id')
        try:
            shift = TblShiftDefinition.objects.get(id=shift_id)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_404_NOT_FOUND)
        shift.is_active = False
        shift.save()
        return Response({'message': 'Shift deactivated successfully.'})


class ShiftPlanningView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        qs = TblShiftPlanning.objects.select_related('shift', 'work_center')
        if request.query_params.get('all') != 'true':
            qs = qs.filter(is_active=True)
        return Response(ShiftPlanningSerializer(qs, many=True).data)

    def post(self, request):
        shift_name = request.data.get('shift', '').strip()
        work_center_name = request.data.get('work_center', '').strip()
        active = request.data.get('active', 'Yes')
        if not shift_name:
            return Response({'error': 'Shift is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not work_center_name:
            return Response({'error': 'Work Centre is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            shift = TblShiftDefinition.objects.get(shift_name=shift_name, is_active=True)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            work_center = TblWorkCenter.objects.get(work_center=work_center_name, is_active=True)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Centre not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblShiftPlanning.objects.filter(shift=shift, work_center=work_center, is_active=True).exists():
            return Response({'error': 'This Shift + Work Centre combination already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        new_id = (TblShiftPlanning.objects.order_by('-id').first().id + 1) if TblShiftPlanning.objects.exists() else 1
        TblShiftPlanning.objects.create(
            id=new_id, shift=shift, work_center=work_center, active=(active == 'Yes')
        )
        return Response({'message': 'Shift Planning created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        planning_id = request.data.get('id')
        try:
            planning = TblShiftPlanning.objects.get(id=planning_id)
        except TblShiftPlanning.DoesNotExist:
            return Response({'error': 'Shift Planning not found.'}, status=status.HTTP_404_NOT_FOUND)
        planning.active = not planning.active
        planning.save()
        state = 'activated' if planning.active else 'deactivated'
        return Response({'message': f'Shift Planning {state} successfully.'})

    def delete(self, request):
        planning_id = request.data.get('id')
        try:
            planning = TblShiftPlanning.objects.get(id=planning_id)
        except TblShiftPlanning.DoesNotExist:
            return Response({'error': 'Shift Planning not found.'}, status=status.HTTP_404_NOT_FOUND)
        planning.is_active = not planning.is_active
        planning.save()
        state = 'activated' if planning.is_active else 'deactivated'
        return Response({'message': f'Shift Planning {state} successfully.'})


class TransactionView(APIView):

    def _next_id(self, model):
        last = model.objects.order_by('-id').first()
        return (last.id + 1) if last else 1

    def get(self, request):
        facility = request.query_params.get('facility')
        work_center = request.query_params.get('work_center')
        shift_name = request.query_params.get('shift')
        date = request.query_params.get('date')  # YYYY-MM-DD

        if not all([facility, work_center, shift_name, date]):
            return Response({'error': 'facility, work_center, shift, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            shift = TblShiftDefinition.objects.get(shift_name=shift_name, is_active=True)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            planning = TblShiftPlanning.objects.get(shift=shift, work_center__work_center=work_center)
        except TblShiftPlanning.DoesNotExist:
            planning = None

        if not planning:
            return Response({'exists': False})

        labour = TblResourceLabour.objects.filter(
            facility__facility=facility,
            work_center__work_center=work_center,
            scheduled_shift=planning,
            transaction_date__date=date,
        ).first()

        if not labour:
            return Response({'exists': False})

        downtime = [
            {
                'id': d.id,
                'module': TblEquipment.objects.filter(resource=d.resource).values_list('equipment', flat=True).first(),
                'reasonCode': d.reason_code.reason_code,
                'duration': d.duration,
            }
            for d in TblResourceLabourDetailModuleDowntime.objects.filter(parent=labour).select_related('resource', 'reason_code')
        ]
        target_cycle = [
            {
                'id': t.id,
                'module': TblEquipment.objects.filter(resource=t.resource).values_list('equipment', flat=True).first(),
                'targetCycle': t.target_cycle_time,
            }
            for t in TblResourceLabourDetailModule.objects.filter(parent=labour).select_related('resource')
        ]
        resource_plan = [
            {
                'id': r.id,
                'workStation': r.resource.resource_name,
                'resourceCount': r.resource_count,
                'resourceNames': r.resource_names,
            }
            for r in TblResourceLabourDetailWorkstation.objects.filter(parent=labour).select_related('resource')
        ]

        production_qs = TblProduction.objects.filter(
            facility__facility=facility, work_center__work_center=work_center,
            scheduled_shift=planning, transaction_date__date=date,
        )
        production = []
        for p in production_qs:
            nok = TblNokProduction.objects.filter(parent=p).first()
            production.append({
                'id': p.id,
                'variantType': p.product.product_no,
                'okCount': p.produce_quantity,
                'nokCount': p.nok_produced_quantity,
                'nokType': nok.nok_type if nok else '',
                'nokReasonCode': nok.nok_reason_code.reason_code if nok else '',
            })

        parent = TblParent.objects.filter(
            facility__facility=facility, work_center__work_center=work_center,
            scheduled_shift=planning, transaction_date__date=date,
        ).first()
        complaints = []
        if parent:
            complaints = [
                {
                    'id': c.id,
                    'variantType': c.product.product_no,
                    'reason': c.reason,
                    'details': c.details,
                }
                for c in TblCustComplaint.objects.filter(parent=parent).select_related('product')
            ]

        return Response({
            'exists': True,
            'labour_id': labour.id,
            'downtime': downtime,
            'targetCycle': target_cycle,
            'resourcePlan': resource_plan,
            'production': production,
            'complaints': complaints,
        })

    def post(self, request):
        data = request.data
        facility_name = data.get('facility')
        work_center_name = data.get('work_center')
        shift_name = data.get('shift')
        date_str = data.get('date')
        employee_no = data.get('employee_no')

        if not all([facility_name, work_center_name, shift_name, date_str, employee_no]):
            return Response({'error': 'facility, work_center, shift, date, and employee_no are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            facility = TblFacility.objects.get(facility=facility_name)
        except TblFacility.DoesNotExist:
            return Response({'error': 'Plant not found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            work_center = TblWorkCenter.objects.get(work_center=work_center_name)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Center not found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            shift = TblShiftDefinition.objects.get(shift_name=shift_name, is_active=True)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            employee = TblEmployee.objects.get(employee_no=employee_no, is_active=True)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            planning = TblShiftPlanning.objects.get(shift=shift, work_center=work_center)
        except TblShiftPlanning.DoesNotExist:
            new_plan_id = (TblShiftPlanning.objects.order_by('-id').first().id + 1) if TblShiftPlanning.objects.exists() else 1
            planning = TblShiftPlanning.objects.create(
                id=new_plan_id, shift=shift, work_center=work_center, active=True
            )

        transaction_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        labour_id = f"{facility_name}-{work_center_name}-{shift_name}-{date_str}"

        labour, _ = TblResourceLabour.objects.get_or_create(
            id=labour_id,
            defaults={
                'transaction_date': transaction_date,
                'scheduled_shift': planning,
                'facility': facility,
                'work_center': work_center,
                'employee': employee,
            }
        )

        # Save downtime
        TblResourceLabourDetailModuleDowntime.objects.filter(parent=labour).delete()
        for row in data.get('downtime', []):
            try:
                resource = TblEquipment.objects.get(equipment=row.get('module'), is_active=True).resource
                reason_code = TblReasonCode.objects.get(reason_code=row.get('reasonCode'))
                TblResourceLabourDetailModuleDowntime.objects.create(
                    id=self._next_id(TblResourceLabourDetailModuleDowntime),
                    parent=labour, resource=resource, reason_code=reason_code,
                    duration=float(row.get('duration') or 0),
                )
            except (TblEquipment.DoesNotExist, TblReasonCode.DoesNotExist, ValueError):
                pass

        # Save target cycle
        TblResourceLabourDetailModule.objects.filter(parent=labour).delete()
        for row in data.get('targetCycle', []):
            try:
                resource = TblEquipment.objects.get(equipment=row.get('module'), is_active=True).resource
                TblResourceLabourDetailModule.objects.create(
                    id=self._next_id(TblResourceLabourDetailModule),
                    parent=labour, resource=resource,
                    target_cycle_time=float(row.get('targetCycle') or 0),
                )
            except (TblEquipment.DoesNotExist, ValueError):
                pass

        # Save resource planning
        TblResourceLabourDetailWorkstation.objects.filter(parent=labour).delete()
        for row in data.get('resourcePlan', []):
            try:
                resource = TblResource.objects.get(resource_name=row.get('workStation'), is_active=True)
                TblResourceLabourDetailWorkstation.objects.create(
                    id=self._next_id(TblResourceLabourDetailWorkstation),
                    parent=labour, resource=resource,
                    resource_count=int(row.get('resourceCount') or 0),
                    resource_names=row.get('resourceNames', ''),
                )
            except (TblResource.DoesNotExist, ValueError):
                pass

        # Save production
        TblProduction.objects.filter(
            facility=facility, work_center=work_center,
            scheduled_shift=planning, transaction_date__date=date_str,
        ).delete()
        for row in data.get('production', []):
            try:
                product = TblProduct.objects.get(product_no=row.get('variantType'), is_active=True)
                prod_id = f"{labour_id}-{row.get('variantType')}"
                prod = TblProduction.objects.create(
                    id=prod_id,
                    transaction_date=transaction_date,
                    scheduled_shift=planning,
                    facility=facility, work_center=work_center, employee=employee,
                    product=product,
                    produce_quantity=int(row.get('okCount', 0)),
                    nok_produced_quantity=int(row.get('nokCount', 0)),
                )
                if row.get('nokCount') and int(row.get('nokCount', 0)) > 0:
                    try:
                        nok_rc = TblReasonCode.objects.get(reason_code=row.get('nokReasonCode'))
                        TblNokProduction.objects.create(
                            id=self._next_id(TblNokProduction),
                            parent=prod,
                            nok_count=int(row.get('nokCount', 0)),
                            nok_reason_code=nok_rc,
                            nok_type=row.get('nokType', ''),
                        )
                    except TblReasonCode.DoesNotExist:
                        pass
            except TblProduct.DoesNotExist:
                pass

        # Save complaints
        parent_id = f"{labour_id}-parent"
        complaints_data = data.get('complaints', [])
        if complaints_data:
            parent_obj, _ = TblParent.objects.get_or_create(
                id=parent_id,
                defaults={
                    'transaction_date': transaction_date,
                    'scheduled_shift': planning,
                    'facility': facility, 'work_center': work_center, 'employee': employee,
                }
            )
            TblCustComplaint.objects.filter(parent=parent_obj).delete()
            for row in complaints_data:
                try:
                    product = TblProduct.objects.get(product_no=row.get('variantType'), is_active=True)
                    TblCustComplaint.objects.create(
                        id=self._next_id(TblCustComplaint),
                        parent=parent_obj, product=product,
                        reason=row.get('reason', ''),
                        details=row.get('details', ''),
                    )
                except TblProduct.DoesNotExist:
                    pass

        return Response({'message': 'Transaction saved successfully.'}, status=status.HTTP_201_CREATED)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee_no = None
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            import jwt
            payload = jwt.decode(token, options={'verify_signature': False})
            employee_no = payload.get('employee_no')
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not any(c.isupper() for c in new_password):
            return Response({'error': 'New password must contain at least 1 uppercase letter.'}, status=status.HTTP_400_BAD_REQUEST)
        if not any(c.isdigit() for c in new_password):
            return Response({'error': 'New password must contain at least 1 number.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = TblEmployee.objects.get(employee_no=employee_no)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not check_password(current_password, employee.pass_word):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        employee.pass_word = make_password(new_password)
        employee.save()
        return Response({'message': 'Password changed successfully.'})


class ProductionDashboardView(APIView):

    def get(self, request):
        facility = request.query_params.get('facility')
        work_center = request.query_params.get('work_center')
        workstation = request.query_params.get('workstation')
        module = request.query_params.get('module')
        shift_name = request.query_params.get('shift')
        variant = request.query_params.get('variant')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        # Base production queryset
        prod_qs = TblProduction.objects.select_related('product', 'scheduled_shift__shift', 'work_center', 'facility')
        if facility:
            prod_qs = prod_qs.filter(facility__facility=facility)
        if work_center:
            prod_qs = prod_qs.filter(work_center__work_center=work_center)
        if shift_name:
            prod_qs = prod_qs.filter(scheduled_shift__shift__shift_name=shift_name)
        if variant:
            prod_qs = prod_qs.filter(product__product_no=variant)
        if date_from:
            prod_qs = prod_qs.filter(transaction_date__date__gte=date_from)
        if date_to:
            prod_qs = prod_qs.filter(transaction_date__date__lte=date_to)

        # KPIs
        total_ok = sum(p.produce_quantity or 0 for p in prod_qs)
        total_nok = sum(p.nok_produced_quantity or 0 for p in prod_qs)
        total = total_ok + total_nok
        quality = round((total_ok / total * 100), 1) if total > 0 else 0

        # Downtime queryset
        dt_qs = TblResourceLabourDetailModuleDowntime.objects.select_related('reason_code', 'resource')
        if facility:
            dt_qs = dt_qs.filter(parent__facility__facility=facility)
        if work_center:
            dt_qs = dt_qs.filter(parent__work_center__work_center=work_center)
        if shift_name:
            dt_qs = dt_qs.filter(parent__scheduled_shift__shift__shift_name=shift_name)
        if workstation:
            dt_qs = dt_qs.filter(resource__resource_name=workstation)
        if module:
            dt_qs = dt_qs.filter(resource__tblequipment__equipment=module)
        if date_from:
            dt_qs = dt_qs.filter(parent__transaction_date__date__gte=date_from)
        if date_to:
            dt_qs = dt_qs.filter(parent__transaction_date__date__lte=date_to)

        total_downtime = float(sum(d.duration or 0 for d in dt_qs))

        # Production by variant
        variant_map = {}
        for p in prod_qs:
            key = p.product.product_no
            if key not in variant_map:
                variant_map[key] = {'variant': key, 'ok': 0, 'nok': 0}
            variant_map[key]['ok'] += p.produce_quantity or 0
            variant_map[key]['nok'] += p.nok_produced_quantity or 0
        production_by_variant = list(variant_map.values())

        # Downtime by reason code
        reason_map = {}
        for d in dt_qs:
            key = d.reason_code.reason_code
            if key not in reason_map:
                reason_map[key] = {'reasonCode': key, 'description': d.reason_code.description or key, 'duration': 0}
            reason_map[key]['duration'] += float(d.duration or 0)
        downtime_by_reason = list(reason_map.values())

        # Production trend by date
        trend_map = {}
        for p in prod_qs:
            day = str(p.transaction_date.date())
            if day not in trend_map:
                trend_map[day] = {'date': day, 'ok': 0, 'nok': 0}
            trend_map[day]['ok'] += p.produce_quantity or 0
            trend_map[day]['nok'] += p.nok_produced_quantity or 0
        production_trend = sorted(trend_map.values(), key=lambda x: x['date'])

        # NOK by type
        nok_qs = TblNokProduction.objects.select_related('nok_reason_code')
        if facility:
            nok_qs = nok_qs.filter(parent__facility__facility=facility)
        if work_center:
            nok_qs = nok_qs.filter(parent__work_center__work_center=work_center)
        if shift_name:
            nok_qs = nok_qs.filter(parent__scheduled_shift__shift__shift_name=shift_name)
        if variant:
            nok_qs = nok_qs.filter(parent__product__product_no=variant)
        if date_from:
            nok_qs = nok_qs.filter(parent__transaction_date__date__gte=date_from)
        if date_to:
            nok_qs = nok_qs.filter(parent__transaction_date__date__lte=date_to)

        nok_type_map = {}
        for n in nok_qs:
            key = n.nok_type or 'Unknown'
            nok_type_map[key] = nok_type_map.get(key, 0) + (n.nok_count or 0)
        nok_by_type = [{'type': k, 'count': v} for k, v in nok_type_map.items()]

        return Response({
            'kpis': {
                'totalOk': total_ok,
                'totalNok': total_nok,
                'totalProduction': total,
                'quality': quality,
                'totalDowntime': total_downtime,
            },
            'productionByVariant': production_by_variant,
            'downtimeByReason': downtime_by_reason,
            'productionTrend': production_trend,
            'nokByType': nok_by_type,
        })


class ProductListView(APIView):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
        if request.query_params.get('all') == 'true':
            products = TblProduct.objects.all().order_by('-is_active', 'product_no')
        else:
            products = TblProduct.objects.filter(is_active=True).order_by('product_no')
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        product_no = request.data.get('product_no', '').strip()
        description = request.data.get('description', '').strip()
        traceability = request.data.get('traceability', 'None')

        if not product_no:
            return Response({'error': 'Material Number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(product_no):
            return Response({'error': 'Material Number cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(description):
            return Response({'error': 'Description cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblProduct.objects.filter(product_no=product_no, is_active=True).exists():
            return Response({'error': 'Material Number already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        traceability_list = traceability if isinstance(traceability, list) else [traceability]
        traceability_str = ','.join(traceability_list) if traceability_list else 'None'
        lot_tracking = 1 if 'Batch' in traceability_list else 0
        serial_tracking = 1 if 'Serial' in traceability_list else 0

        new_id = (TblProduct.objects.order_by('-id').first().id + 1) if TblProduct.objects.exists() else 1
        TblProduct.objects.create(
            id=new_id,
            product_no=product_no,
            description=description,
            traceability=traceability_str,
            lot_tracking_code=lot_tracking,
            serial_tracking_code=serial_tracking,
            fraction_allowed=0,
            default_uom_code='EA',
        )
        return Response({'message': 'Product created successfully.'}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        product_id = request.data.get('id')
        try:
            product = TblProduct.objects.get(id=product_id)
        except TblProduct.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Edit mode — if description sent, update fields
        if 'description' in request.data:
            description = request.data.get('description', '').strip()
            traceability = request.data.get('traceability', [])
            if not description:
                return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
            traceability_list = traceability if isinstance(traceability, list) else [traceability]
            product.description = description
            product.traceability = ','.join(traceability_list) if traceability_list else 'None'
            product.lot_tracking_code = 1 if 'Batch' in traceability_list else 0
            product.serial_tracking_code = 1 if 'Serial' in traceability_list else 0
            product.save()
            return Response({'message': 'Product updated successfully.'})
        # Toggle active
        product.is_active = not product.is_active
        product.save()
        state = 'activated' if product.is_active else 'deactivated'
        return Response({'message': f'Product {state} successfully.'})

    def delete(self, request):
        product_id = request.data.get('id')
        try:
            product = TblProduct.objects.get(id=product_id)
        except TblProduct.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_active = False
        product.save()
        return Response({'message': 'Product deleted successfully.'})
