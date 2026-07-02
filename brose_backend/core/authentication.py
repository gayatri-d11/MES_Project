from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import TblEmployee

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            return None

    def get_user(self, validated_token):
        try:
            employee_no = validated_token['employee_no']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')
        
        try:
            return TblEmployee.objects.get(employee_no=employee_no, is_active=True)
        except TblEmployee.DoesNotExist:
            raise AuthenticationFailed('User not found')
