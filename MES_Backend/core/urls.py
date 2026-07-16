from django.urls import path
from .views import (
    LoginView, EmployeeListView, EmployeeDetailView,
    RoleListView, RoleDetailView,
    PlantListView, WorkCenterListView, WorkstationListView, MachineListView,
    ReasonTypeListView, ReasonCodeListView, ProductListView, ShiftListView,
    ShiftPlanningView, TransactionView, TransactionSectionView, TransactionCalculateView,
    ProductionDashboardView, ChangePasswordView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('employees/', EmployeeListView.as_view(), name='employees'),
    path('employees/<int:employee_id>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('roles/', RoleListView.as_view(), name='roles'),
    path('roles/<int:role_id>/', RoleDetailView.as_view(), name='role-detail'),
    path('plants/', PlantListView.as_view(), name='plants'),
    path('work-centers/', WorkCenterListView.as_view(), name='work-centers'),
    path('workstations/', WorkstationListView.as_view(), name='workstations'),
    path('machines/', MachineListView.as_view(), name='machines'),
    path('reason-types/', ReasonTypeListView.as_view(), name='reason-types'),
    path('reason-codes/', ReasonCodeListView.as_view(), name='reason-codes'),
    path('products/', ProductListView.as_view(), name='products'),
    path('shifts/', ShiftListView.as_view(), name='shifts'),
    path('shift-planning/', ShiftPlanningView.as_view(), name='shift-planning'),
    path('transactions/', TransactionView.as_view(), name='transactions'),
    path('transactions/section/', TransactionSectionView.as_view(), name='transaction-section'),
    path('transactions/calculate/', TransactionCalculateView.as_view(), name='transaction-calculate'),
    path('production-dashboard/', ProductionDashboardView.as_view(), name='production-dashboard'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
