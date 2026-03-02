from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'consultation_fee', 'status', 'created_at']
    list_filter = ['status']
