from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.exceptions import AuthenticationFailed as DRFAuthFailed
from .models import TblEmployee

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None  # No token — let permission class decide
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            raise DRFAuthFailed('Token is invalid or expired.')
        return self.get_user(validated_token), validated_token

    def get_user(self, validated_token):
        try:
            employee_no = validated_token['employee_no']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')
        try:
            return TblEmployee.objects.get(employee_no=employee_no, is_active=True)
        except TblEmployee.DoesNotExist:
            raise DRFAuthFailed('User not found or inactive.')
