from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Doctor
from .serializers import DoctorSerializer


class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctors = Doctor.objects.select_related('user').all()
        return Response(DoctorSerializer(doctors, many=True).data)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doctor = Doctor.objects.select_related('user').get(pk=pk)
        except Doctor.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        return Response(DoctorSerializer(doctor).data)
