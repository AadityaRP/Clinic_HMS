from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Prescription
from .serializers import PrescriptionSerializer
from billing.models import Bill


class PrescriptionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prescriptions = Prescription.objects.select_related('patient', 'doctor__user').all()
        doctor_id = request.query_params.get('doctor')
        patient_id = request.query_params.get('patient')
        if doctor_id:
            prescriptions = prescriptions.filter(doctor_id=doctor_id)
        if patient_id:
            prescriptions = prescriptions.filter(patient_id=patient_id)
        return Response(PrescriptionSerializer(prescriptions, many=True).data)

    def post(self, request):
        serializer = PrescriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation_fee = serializer.validated_data.pop('consultation_fee', 500)
        prescription = serializer.save()

        # Auto-create billing record
        Bill.objects.create(
            patient=prescription.patient,
            doctor=prescription.doctor,
            prescription=prescription,
            consultation_fee=consultation_fee,
            status='pending',
        )

        # Mark appointment as completed if linked
        if prescription.appointment:
            prescription.appointment.status = 'completed'
            prescription.appointment.save(update_fields=['status'])

        return Response(PrescriptionSerializer(prescription).data, status=201)


class PrescriptionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            p = Prescription.objects.select_related('patient', 'doctor__user').get(pk=pk)
        except Prescription.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        return Response(PrescriptionSerializer(p).data)
