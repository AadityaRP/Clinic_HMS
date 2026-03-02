from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('checked_in', 'Checked In'),
        ('completed', 'Completed'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='appointments')
    date = models.DateField()
    time = models.TimeField()
    issue = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    token_number = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', 'time']

    def __str__(self):
        return f"{self.patient.full_name} → {self.doctor} on {self.date}"

    def save(self, *args, **kwargs):
        if not self.token_number:
            from django.db.models import Max
            last = Appointment.objects.filter(date=self.date).aggregate(Max('token_number'))['token_number__max']
            self.token_number = (last or 0) + 1
        super().save(*args, **kwargs)
