from rest_framework import serializers
from .models import Doctor
from core.serializers import UserSerializer


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.ReadOnlyField()

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'name', 'specialty', 'phone']
