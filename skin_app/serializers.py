from rest_framework import serializers
from .models import Userdetails
from django.contrib.auth.hashers import make_password
from.models import UserImage


class UserdetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Userdetails
        fields = ['username', 'email', 'password', 'phone']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value
    
    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value
    
    def create(self, validated_data):
        # Hash the password before saving
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Hash the password if it's being updated
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
        

class UserImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = UserImage
        fields = ['id', 'user', 'image', 'uploaded_at','predicted_disease','predicted_confidence','image_url','symptoms',
            'remedies',
            'cure',
            'prevention',]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None 