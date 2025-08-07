from django.db import models


# Create your models here.

class Userdetails(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    phone = models.CharField(max_length=15)
    
    def __str__(self):
        return self.username

class UserImage(models.Model):
    user = models.ForeignKey(Userdetails, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='uploads/')  # Saves to MEDIA_ROOT/uploads/
    uploaded_at = models.DateTimeField(auto_now_add=True)
    predicted_disease = models.CharField(max_length=100, null=True, blank=True) 

    def __str__(self):
        return f"Image by {self.user.username} at {self.uploaded_at}"


