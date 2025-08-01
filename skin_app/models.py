from django.db import models

# Create your models here.

class Userdetails(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    phone = models.CharField(max_length=15)
    
    def __str__(self):
        return self.username
