from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/billing/', include('billing.urls')),
]
