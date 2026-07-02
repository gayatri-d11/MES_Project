from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .models import TblEmployee, TblEmployeeRole, TblRole, TblResource, TblRolePermission
from .serializers import LoginSerializer, EmployeeSerializer, CreateEmployeeSerializer, RoleSerializer
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        employee_no = serializer.validated_data['employee_no']
        password = serializer.validated_data['password']

        try:
            employee = TblEmployee.objects.get(employee_no=employee_no, is_active=True)
        except TblEmployee.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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
        employees = TblEmployee.objects.filter(is_active=True)
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
        return Response({'message': 'Employee deleted successfully'})


       