from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientListSerializer
from doctors.serializers import DoctorSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    patient_detail = PatientListSerializer(source='patient', read_only=True)
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)
    patient = serializers.PrimaryKeyRelatedField(queryset=__import__('patients.models', fromlist=['Patient']).Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=__import__('doctors.models', fromlist=['Doctor']).Doctor.objects.all(), allow_null=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_detail', 'doctor', 'doctor_detail',
            'date', 'time', 'issue', 'status', 'token_number', 'created_at'
        ]
        read_only_fields = ['token_number', 'created_at']
