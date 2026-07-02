import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .models import TblEmployee, TblEmployeeRole, TblRole, TblResource, TblRolePermission, TblFacility, TblWorkCenter, TblEquipment, TblResourceType, TblEquipmentType, TblReasonCode, TblReasonType, TblProduct, TblShiftDefinition
from .serializers import LoginSerializer, EmployeeSerializer, CreateEmployeeSerializer, RoleSerializer, PlantSerializer, WorkCenterSerializer, WorkstationSerializer, MachineSerializer, ReasonCodeSerializer, ReasonTypeSerializer, ProductSerializer, ShiftSerializer
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

NAME_RE = re.compile(r'^[a-zA-Z0-9\s\-_]+$')


class LoginView(APIView):
    permission_classes = []

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
    permission_classes = []

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
    permission_classes = []

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
    permission_classes = []

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
    permission_classes = []

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
    permission_classes = []
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
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
        old_name = request.data.get('facility', '').strip()
        new_name = request.data.get('new_facility', '').strip()
        if not old_name:
            return Response({'error': 'Current plant name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not new_name:
            return Response({'error': 'New plant name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if old_name == new_name:
            return Response({'message': 'No change.'})
        if not NAME_RE.match(new_name):
            return Response({'error': 'Plant name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblFacility.objects.filter(facility=new_name).exists():
            return Response({'error': 'Plant name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            plant = TblFacility.objects.get(facility=old_name)
        except TblFacility.DoesNotExist:
            return Response({'error': 'Plant not found.'}, status=status.HTTP_404_NOT_FOUND)
        plant.facility = new_name
        plant.save()
        return Response({'message': 'Plant renamed successfully.'})

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
    permission_classes = []
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
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
        old_name = request.data.get('work_center', '').strip()
        new_name = request.data.get('new_work_center', '').strip()
        if not new_name:
            return Response({'error': 'New Work Center name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(new_name):
            return Response({'error': 'Work Center name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblWorkCenter.objects.filter(work_center=new_name).exists():
            return Response({'error': 'Work Center name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            wc = TblWorkCenter.objects.get(work_center=old_name)
        except TblWorkCenter.DoesNotExist:
            return Response({'error': 'Work Center not found.'}, status=status.HTTP_404_NOT_FOUND)
        wc.work_center = new_name
        wc.save()
        return Response({'message': 'Work Center renamed successfully.'})

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
    permission_classes = []
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get(self, request):
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
        new_name = request.data.get('new_resource_name', '').strip()
        if not new_name:
            return Response({'error': 'New Workstation name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not NAME_RE.match(new_name):
            return Response({'error': 'Workstation name cannot contain special characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if TblResource.objects.filter(resource_name=new_name).exists():
            return Response({'error': 'Workstation name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ws = TblResource.objects.get(id=resource_id)
        except TblResource.DoesNotExist:
            return Response({'error': 'Workstation not found.'}, status=status.HTTP_404_NOT_FOUND)
        ws.resource_name = new_name
        ws.save()
        return Response({'message': 'Workstation renamed successfully.'})

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
    permission_classes = []

    def get(self, request):
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

    def delete(self, request):
        machine_id = request.data.get('id')
        try:
            machine = TblEquipment.objects.get(id=machine_id)
        except TblEquipment.DoesNotExist:
            return Response({'error': 'Machine not found.'}, status=status.HTTP_404_NOT_FOUND)
        machine.is_active = False
        machine.save()
        return Response({'message': 'Machine deleted successfully.'})


class ReasonTypeListView(APIView):
    permission_classes = []

    def get(self, request):
        return Response(ReasonTypeSerializer(TblReasonType.objects.filter(is_active=True), many=True).data)


class ReasonCodeListView(APIView):
    permission_classes = []
    http_method_names = ['get', 'post', 'delete']

    def get(self, request):
        codes = TblReasonCode.objects.filter(is_active=True).select_related('reason_type')
        return Response(ReasonCodeSerializer(codes, many=True).data)

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
    permission_classes = []
    http_method_names = ['get', 'post', 'delete']

    def get(self, request):
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
        if not break_time:
            return Response({'error': 'Break Time is required.'}, status=status.HTTP_400_BAD_REQUEST)
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

    def delete(self, request):
        shift_id = request.data.get('id')
        try:
            shift = TblShiftDefinition.objects.get(id=shift_id)
        except TblShiftDefinition.DoesNotExist:
            return Response({'error': 'Shift not found.'}, status=status.HTTP_404_NOT_FOUND)
        shift.is_active = False
        shift.save()
        return Response({'message': 'Shift deleted successfully.'})


class ProductListView(APIView):
    permission_classes = []
    http_method_names = ['get', 'post', 'delete']

    def get(self, request):
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

    def delete(self, request):
        product_id = request.data.get('id')
        try:
            product = TblProduct.objects.get(id=product_id)
        except TblProduct.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_active = False
        product.save()
        return Response({'message': 'Product deleted successfully.'})
