from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import Userdetails


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that works with Userdetails model.
    """
    
    def get_user(self, validated_token):
        """
        Override to fetch Userdetails instead of Django's default User model.
        """
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        try:
            user = Userdetails.objects.get(id=user_id)
        except Userdetails.DoesNotExist:
            raise AuthenticationFailed('User not found', code='user_not_found')

        return user
