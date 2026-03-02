from rest_framework import serializers
from .models import Prescription
from patients.serializers import PatientListSerializer
from doctors.serializers import DoctorSerializer


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_detail = PatientListSerializer(source='patient', read_only=True)
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)
    patient = serializers.PrimaryKeyRelatedField(queryset=__import__('patients.models', fromlist=['Patient']).Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=__import__('doctors.models', fromlist=['Doctor']).Doctor.objects.all(), allow_null=True)
    appointment = serializers.PrimaryKeyRelatedField(
        queryset=__import__('appointments.models', fromlist=['Appointment']).Appointment.objects.all(),
        allow_null=True, required=False
    )
    consultation_fee = serializers.DecimalField(max_digits=8, decimal_places=2, write_only=True, required=False, default=500)

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'patient_detail', 'doctor', 'doctor_detail', 'appointment', 'text', 'notes', 'consultation_fee', 'created_at']
        read_only_fields = ['created_at']
