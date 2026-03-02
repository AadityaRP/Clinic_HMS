from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer


class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '')
        patients = Patient.objects.all()
        if q:
            patients = patients.filter(
                Q(full_name__icontains=q) |
                Q(phone__icontains=q) |
                Q(patient_id__icontains=q)
            )
        return Response(PatientListSerializer(patients, many=True).data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return None

    def get(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response({'error': 'Not found'}, status=404)
        return Response(PatientSerializer(patient).data)

    def put(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response({'error': 'Not found'}, status=404)
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PatientVisitHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        from appointments.models import Appointment
        from appointments.serializers import AppointmentSerializer
        appointments = Appointment.objects.filter(patient=patient).order_by('-date', '-time')
        return Response(AppointmentSerializer(appointments, many=True).data)
