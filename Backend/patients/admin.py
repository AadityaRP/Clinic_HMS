from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'full_name', 'age', 'blood_type', 'phone', 'created_at']
    search_fields = ['full_name', 'phone', 'patient_id']
