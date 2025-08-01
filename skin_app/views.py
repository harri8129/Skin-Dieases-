from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.db import models
from .models import Userdetails
from .serializers import UserdetailsSerializer


class UserdetailsViewSet(viewsets.ModelViewSet):
    queryset = Userdetails.objects.all()
    serializer_class = UserdetailsSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login endpoint that validates username/email and password
        """
        username_or_email = request.data.get('username_or_email')
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response(
                {'error': 'Username/Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find user by username or email
        try:
            user = Userdetails.objects.get(
                models.Q(username=username_or_email) | 
                models.Q(email=username_or_email)
            )
        except Userdetails.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check password
        if check_password(password, user.password):
            # Return user data (excluding password)
            serializer = self.get_serializer(user)
            return Response({
                'message': 'Login successful',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )




