from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Userdetails, UserImage
from .serializers import UserdetailsSerializer, UserImageSerializer
from .ml_models.ml_model import predict_disease
from dotenv import load_dotenv
import re
import json
import logging
from .helpers.llm_helper import generate_disease_report
import google.generativeai as genai
from .utils.pdf_generator import generate_pdf_report
from django.http import FileResponse

# JWT imports
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken


logger = logging.getLogger(__name__)
load_dotenv()

# Configure Gemini API
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def get_tokens_for_user(user):
    """Generate access and refresh tokens for a user"""
    refresh = RefreshToken()
    refresh['user_id'] = user.id
    refresh['username'] = user.username
    refresh['email'] = user.email
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# User registration & login
class UserdetailsViewSet(viewsets.ModelViewSet):
    queryset = Userdetails.objects.all()
    serializer_class = UserdetailsSerializer

    def get_permissions(self):
        """Allow anyone to register or login, require authentication for other actions"""
        if self.action in ['create', 'login', 'check_auth', 'refresh_token']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        username_or_email = request.data.get('username_or_email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response({'error': 'Username/Email and password are required'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Userdetails.objects.get(
                models.Q(username=username_or_email) |
                models.Q(email=username_or_email)
            )
        except Userdetails.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone
            },
            'access': tokens['access'],
            'refresh': tokens['refresh']
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh_token(self, request):
        """Refresh access token using refresh token"""
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh.get('user_id')
            
            # Get user details
            user = get_object_or_404(Userdetails, id=user_id)
            
            # Generate new tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
            
        except TokenError as e:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        """Logout user by blacklisting the refresh token"""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user is authenticated (for ProtectedRoute)
    @action(detail=False, methods=['get'], url_path='check-auth')
    def check_auth(self, request):
        # JWT authentication is handled by permission classes
        if request.user and request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                }
            }, status=status.HTTP_200_OK)
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)


# Upload image, predict disease & history
class UserImageViewSet(viewsets.ModelViewSet):
    serializer_class = UserImageSerializer
    queryset = UserImage.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only return images belonging to the authenticated user"""
        return UserImage.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        # User is already authenticated via JWT
        user = request.user

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'Image file is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Link image to logged-in user
        user_image = UserImage.objects.create(user=user, image=image_file)

        # Predict disease
        predicted_disease, confidence = predict_disease(user_image.image.path)

        # Save prediction
        user_image.predicted_disease = predicted_disease
        user_image.predicted_confidence = confidence
        user_image.save()

        serializer = self.get_serializer(user_image)
        return Response({
            'message': 'Image uploaded and disease predicted',
            'predicted_disease': predicted_disease,
            'confidence': confidence,
            'image': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        # User is already authenticated via JWT
        user_images = UserImage.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer = self.get_serializer(user_images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Download PDF Report
    @action(detail=True, methods=['get'], url_path='download-report')
    def download_report(self, request, pk=None):
        # User is already authenticated via JWT
        user_image = get_object_or_404(UserImage, id=pk, user=request.user)

        buffer = generate_pdf_report(
            user_name=user_image.user.username,
            disease_name=user_image.predicted_disease or "Not Available",
            symptoms=user_image.symptoms or "Not Available",
            prevention=user_image.prevention or "Not Available",
            remedies=user_image.remedies or "Not Available",
            cure=user_image.cure or "Not Available",
            image_path=user_image.image.path if user_image.image else None
        )

        return FileResponse(buffer, as_attachment=True, filename=f"Skin_Report_{pk}.pdf")


# Generate LLM disease info
class DiseaseInfoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='generate-info')
    def generate_info(self, request, pk=None):
        user_image = get_object_or_404(UserImage, id=pk, user=request.user)

        if not user_image.predicted_disease:
            return Response({'error': 'No predicted disease found for this image'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            output_text = generate_disease_report(user_image.predicted_disease)
            match = re.search(r"\{.*\}", output_text, re.DOTALL)
            if not match:
                logger.error(f"No JSON found in LLM output: {output_text}")
                return Response({'error': 'No JSON found in LLM output'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            data = json.loads(match.group())
        except json.JSONDecodeError:
            logger.exception("Failed to decode LLM JSON")
            return Response({'error': 'Invalid JSON from LLM'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.exception("Unexpected error during LLM processing")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save LLM info
        user_image.symptoms = data.get("Symptoms", "")
        user_image.remedies = data.get("Remedies", "")
        user_image.cure = data.get("Cure", "")
        user_image.prevention = data.get("Prevention", "")
        user_image.save()

        serializer = UserImageSerializer(user_image, context={'request': request})
        return Response({
            'message': 'LLM information generated successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
