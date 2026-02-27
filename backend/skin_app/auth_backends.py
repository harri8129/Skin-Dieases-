from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from .models import Userdetails


class UserdetailsAuthBackend(BaseBackend):
    """
    Custom authentication backend for Userdetails model.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to get user by username or email
            if '@' in username:
                user = Userdetails.objects.get(email=username)
            else:
                user = Userdetails.objects.get(username=username)
            
            # Check password
            if check_password(password, user.password):
                return user
        except Userdetails.DoesNotExist:
            return None
        return None

    def get_user(self, user_id):
        try:
            return Userdetails.objects.get(pk=user_id)
        except Userdetails.DoesNotExist:
            return None
