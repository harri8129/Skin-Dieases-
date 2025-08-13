from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.db import models
from django.shortcuts import get_object_or_404
from .models import Userdetails, UserImage
from .serializers import UserdetailsSerializer, UserImageSerializer
from .ml_models.ml_model import predict_disease
from django.conf import settings
import json
from groq import Groq
import re


# view set for registeration and login 
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

   
#viewset for uploading image and predicting dieases and storing in database    
class UserImageViewSet(viewsets.ModelViewSet):
    queryset = UserImage.objects.all()
    serializer_class = UserImageSerializer

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        """
        Upload an image and predict skin disease.
        """
        user_id = request.data.get('user')
        image_file = request.FILES.get('image')

        if not user_id or not image_file:
            return Response(
                {'error': 'User ID and image file are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check user
        try:
            user = Userdetails.objects.get(id=user_id)
        except Userdetails.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Save image to model
        user_image = UserImage.objects.create(user=user, image=image_file)

        # Predict disease
        image_path = user_image.image.path
        predicted_disease, confidence = predict_disease(image_path)

        # Save prediction and confidence
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


client = Groq(api_key=settings.GROQ_API_KEY)# Store in settings.py
#viewset for dieases info viewset 
class DiseaseInfoViewSet(viewsets.ViewSet):

    @action(detail=True, methods=['post'], url_path='generate-info')
    def generate_info(self, request, pk=None):
        """
        Take a predicted disease from UserImage and generate symptoms, remedies, cure, prevention using LLM.
        Saves the generated info in DB.
        """
        user_image = get_object_or_404(UserImage, pk=pk)

        if not user_image.predicted_disease:
            return Response(
                {'error': 'No predicted disease found for this image. Run ML prediction first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Strict JSON output prompt
        prompt = f"""
        You are a JSON generator.
        Given the skin disease '{user_image.predicted_disease}', respond ONLY in valid JSON.
        No explanations, no extra text. 
        Format exactly like:
        {{
            "Symptoms": "List symptoms here",
            "Remedies": "List remedies here",
            "Cure": "Describe cure here",
            "Prevention": "List prevention steps here"
        }}
        """

        try:
            # Call Groq API
            llm_response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )

            output_text = llm_response.choices[0].message.content.strip()

            # Extract only the JSON part
            match = re.search(r"\{.*\}", output_text, re.DOTALL)
            if not match:
                return Response(
                    {'error': 'No JSON found in LLM output'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            data = json.loads(match.group())

        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON from LLM'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save in DB
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