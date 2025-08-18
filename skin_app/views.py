from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Userdetails, UserImage
from .serializers import UserdetailsSerializer, UserImageSerializer
from .ml_models.ml_model import predict_disease
from dotenv import load_dotenv
import os
import re
import json
import logging
from .helpers.llm_helper import generate_disease_report
import google.generativeai as genai

logger = logging.getLogger(__name__)
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# User registration & login
class UserdetailsViewSet(viewsets.ModelViewSet):
    queryset = Userdetails.objects.all()
    serializer_class = UserdetailsSerializer

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

        # ✅ Save user in session properly
        request.session['user_id'] = user.id
        request.session.modified = True   # Ensure session is saved
        
        # ✅ Optional: force Django to persist the session immediately
        request.session.save()

        # print("🔹 After login, session data:", dict(request.session))

        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,    
                'phone': user.phone
            }
        }, status=status.HTTP_200_OK)


# ✅ Upload image, predict disease & history
class UserImageViewSet(viewsets.ModelViewSet):
    serializer_class = UserImageSerializer
    queryset = UserImage.objects.all()

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):         
        # print("Session data:", request.session.items())
        user_id = request.session.get("user_id")
        # print("User ID in session:", user_id)

        if not user_id:
            return Response({'error': 'You must be logged in'}, status=status.HTTP_401_UNAUTHORIZED)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'Image file is required'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Link image to logged-in user
        user = get_object_or_404(Userdetails, id=user_id)
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
        user_id = request.session.get('user_id')

        if not user_id:
            return Response({'error': 'You must be logged in'}, status=status.HTTP_401_UNAUTHORIZED)

        user_images = UserImage.objects.filter(user_id=user_id).order_by('-uploaded_at')
        serializer = self.get_serializer(user_images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Generate LLM disease info
class DiseaseInfoViewSet(viewsets.ViewSet):
    @action(detail=True, methods=['post'], url_path='generate-info')
    def generate_info(self, request, pk=None):
        user_image = get_object_or_404(UserImage, id=pk)

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
