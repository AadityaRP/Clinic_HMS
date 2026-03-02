from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    last_visit = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name', 'age', 'date_of_birth',
            'blood_type', 'weight', 'phone', 'issue', 'allergies',
            'created_at', 'last_visit'
        ]
        read_only_fields = ['patient_id', 'created_at']


class PatientListSerializer(serializers.ModelSerializer):
    last_visit = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = ['id', 'patient_id', 'full_name', 'age', 'phone', 'blood_type', 'created_at', 'last_visit']
