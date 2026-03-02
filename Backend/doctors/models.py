from django.db import models
from core.models import User


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialty}"

    @property
    def name(self):
        return f"Dr. {self.user.get_full_name()}"
