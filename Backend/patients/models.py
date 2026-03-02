import uuid
from django.db import models


def generate_patient_id():
    return 'P' + str(uuid.uuid4()).upper().replace('-', '')[:7]


class Patient(models.Model):
    BLOOD_TYPES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    patient_id = models.CharField(max_length=20, unique=True, default=generate_patient_id)
    full_name = models.CharField(max_length=200)
    age = models.PositiveIntegerField()
    date_of_birth = models.DateField()
    blood_type = models.CharField(max_length=5, choices=BLOOD_TYPES, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    phone = models.CharField(max_length=20)
    issue = models.TextField(blank=True, help_text='Purpose of visit / Issue description')
    allergies = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.patient_id})"

    @property
    def last_visit(self):
        appt = self.appointments.filter(status='completed').order_by('-date', '-time').first()
        if appt:
            return appt.date
        return None
