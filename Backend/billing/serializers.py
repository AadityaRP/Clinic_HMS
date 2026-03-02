from rest_framework import serializers
from .models import Bill
from patients.serializers import PatientListSerializer
from doctors.serializers import DoctorSerializer


class BillSerializer(serializers.ModelSerializer):
    patient_detail = PatientListSerializer(source='patient', read_only=True)
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)
    prescription_text = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id', 'patient', 'patient_detail', 'doctor', 'doctor_detail',
            'prescription', 'prescription_text', 'consultation_fee', 'status', 'created_at'
        ]
        read_only_fields = ['created_at', 'patient', 'doctor', 'prescription']

    def get_prescription_text(self, obj):
        if obj.prescription:
            return obj.prescription.text[:200]
        return ''
