from django.urls import path
from .views import BillListView, BillDetailView

urlpatterns = [
    path('', BillListView.as_view(), name='bill-list'),
    path('<int:pk>/', BillDetailView.as_view(), name='bill-detail'),
]
