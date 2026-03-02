from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.select_related('patient', 'doctor__user').all()
        date = request.query_params.get('date')
        doctor_id = request.query_params.get('doctor')
        status = request.query_params.get('status')
        today = request.query_params.get('today')

        if today:
            appointments = appointments.filter(date=timezone.now().date())
        if date:
            appointments = appointments.filter(date=date)
        if doctor_id:
            appointments = appointments.filter(doctor_id=doctor_id)
        if status:
            appointments = appointments.filter(status=status)

        return Response(AppointmentSerializer(appointments, many=True).data)

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Appointment.objects.select_related('patient', 'doctor__user').get(pk=pk)
        except Appointment.DoesNotExist:
            return None

    def get(self, request, pk):
        appt = self.get_object(pk)
        if not appt:
            return Response({'error': 'Not found'}, status=404)
        return Response(AppointmentSerializer(appt).data)

    def put(self, request, pk):
        appt = self.get_object(pk)
        if not appt:
            return Response({'error': 'Not found'}, status=404)
        serializer = AppointmentSerializer(appt, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        appt = self.get_object(pk)
        if not appt:
            return Response({'error': 'Not found'}, status=404)
        appt.delete()
        return Response(status=204)
