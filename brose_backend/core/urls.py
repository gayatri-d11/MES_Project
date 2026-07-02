from django.urls import path
from .views import LoginView, EmployeeListView, RoleListView, RoleDetailView, EmployeeDetailView




urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('employees/', EmployeeListView.as_view(), name='employees'),
    path('employees/<int:employee_id>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('roles/', RoleListView.as_view(), name='roles'),
    path('roles/<int:role_id>/', RoleDetailView.as_view(), name='role-detail'),

]
