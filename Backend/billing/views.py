from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Bill
from .serializers import BillSerializer


class BillListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bills = Bill.objects.select_related('patient', 'doctor__user', 'prescription').all()
        status = request.query_params.get('status')
        if status:
            bills = bills.filter(status=status)
        return Response(BillSerializer(bills, many=True).data)


class BillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Bill.objects.select_related('patient', 'doctor__user', 'prescription').get(pk=pk)
        except Bill.DoesNotExist:
            return None

    def get(self, request, pk):
        bill = self.get_object(pk)
        if not bill:
            return Response({'error': 'Not found'}, status=404)
        return Response(BillSerializer(bill).data)

    def put(self, request, pk):
        bill = self.get_object(pk)
        if not bill:
            return Response({'error': 'Not found'}, status=404)
        serializer = BillSerializer(bill, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(BillSerializer(bill).data)
