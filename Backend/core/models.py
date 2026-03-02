from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('frontdesk', 'Frontdesk'),
        ('doctor', 'Doctor'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='frontdesk')
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
