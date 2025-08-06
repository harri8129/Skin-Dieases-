from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.db import models
from django.shortcuts import get_object_or_404

from .models import Userdetails, UserImage
from .serializers import UserdetailsSerializer, UserImageSerializer


class UserdetailsViewSet(viewsets.ModelViewSet):
    queryset = Userdetails.objects.all()
    serializer_class = UserdetailsSerializer

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        """
        Login endpoint that validates username/email and password.
        Returns user data with ID.
        """
        username_or_email = request.data.get('username_or_email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response(
                {'error': 'Username/Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Search by username or email
        try:
            user = Userdetails.objects.get(
                models.Q(username=username_or_email) | 
                models.Q(email=username_or_email)
            )
        except Userdetails.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Validate password
        if not check_password(password, user.password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Return user data (including ID)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone
            }
        }, status=status.HTTP_200_OK)


class UserImageViewSet(viewsets.ModelViewSet):
    queryset = UserImage.objects.all()
    serializer_class = UserImageSerializer

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        """
        Upload an image for a user.
        Requires 'user' (user ID) and 'image' (file) in request.
        """
        user_id = request.data.get('user')
        image_file = request.FILES.get('image')

        if not user_id or not image_file:
            return Response(
                {'error': 'User ID and image file are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Userdetails.objects.get(id=user_id)
        except Userdetails.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user_image = UserImage.objects.create(user=user, image=image_file)
        serializer = self.get_serializer(user_image)

        return Response({
            'message': 'Image uploaded successfully',
            'image': serializer.data
        }, status=status.HTTP_201_CREATED)
