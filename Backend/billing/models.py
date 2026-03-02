from django.db import models
from patients.models import Patient
from doctors.models import Doctor
from prescriptions.models import Prescription


class Bill(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='bills')
    prescription = models.OneToOneField(Prescription, on_delete=models.CASCADE, related_name='bill', null=True, blank=True)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bill #{self.id} - {self.patient.full_name} ({self.status})"
