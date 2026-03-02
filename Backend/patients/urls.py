from django.urls import path
from .views import PatientListCreateView, PatientDetailView, PatientVisitHistoryView

urlpatterns = [
    path('', PatientListCreateView.as_view(), name='patient-list-create'),
    path('<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
    path('<int:pk>/history/', PatientVisitHistoryView.as_view(), name='patient-history'),
]
