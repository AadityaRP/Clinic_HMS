from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, timedelta
import random


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **kwargs):
        from core.models import User
        from doctors.models import Doctor
        from patients.models import Patient
        from appointments.models import Appointment
        from prescriptions.models import Prescription
        from billing.models import Bill

        self.stdout.write('🌱 Seeding database...')

        # ── Users ──────────────────────────────────────────────────────────────
        # Frontdesk
        fd_user, _ = User.objects.get_or_create(email='frontdesk@hms.com', defaults={
            'username': 'frontdesk',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'role': 'frontdesk',
        })
        fd_user.set_password('demo1234')
        fd_user.save()

        # Doctors
        doctor_data = [
            ('doctor1@hms.com', 'dr_arjun', 'Arjun', 'Sharma', 'General Physician'),
            ('doctor2@hms.com', 'dr_priya', 'Priya', 'Nair', 'Diabetologist / Endocrinologist'),
            ('doctor3@hms.com', 'dr_rahul', 'Rahul', 'Mehta', 'Cardiologist'),
        ]

        doctors = []
        for email, uname, fname, lname, specialty in doctor_data:
            u, _ = User.objects.get_or_create(email=email, defaults={
                'username': uname,
                'first_name': fname,
                'last_name': lname,
                'role': 'doctor',
            })
            u.set_password('demo1234')
            u.save()
            doc, _ = Doctor.objects.get_or_create(user=u, defaults={'specialty': specialty, 'phone': '9876543210'})
            doctors.append(doc)

        self.stdout.write('  ✅ Users and doctors created')

        # ── Patients ───────────────────────────────────────────────────────────
        patient_data = [
            ('Ramesh Kumar', 45, date(1980, 3, 15), 'B+', 72.5, '9876543001', 'Diabetes management', 'Penicillin'),
            ('Sunita Devi', 38, date(1987, 7, 22), 'O+', 58.0, '9876543002', 'Chest pain and breathlessness', ''),
            ('Ankit Verma', 29, date(1996, 11, 5), 'A+', 68.0, '9876543003', 'Fever and cold', ''),
            ('Meena Patel', 55, date(1970, 4, 30), 'AB+', 80.0, '9876543004', 'High blood pressure', 'Sulfa drugs'),
            ('Kavitha Reddy', 42, date(1983, 8, 12), 'B-', 63.5, '9876543005', 'Thyroid checkup', ''),
            ('Mohan Das', 63, date(1962, 1, 20), 'O-', 75.0, '9876543006', 'Knee pain and arthritis', 'Aspirin'),
            ('Lakshmi S', 33, date(1992, 6, 8), 'A-', 55.5, '9876543007', 'Pregnancy checkup', ''),
            ('Vijay Singh', 51, date(1974, 9, 25), 'B+', 88.0, '9876543008', 'Diabetes and cholesterol', 'Penicillin'),
            ('Deepa Menon', 27, date(1998, 2, 14), 'O+', 52.0, '9876543009', 'Migraine headaches', ''),
            ('Suresh Babu', 47, date(1978, 12, 3), 'AB-', 78.5, '9876543010', 'Heart palpitations', ''),
        ]

        patients = []
        for name, age, dob, bt, wt, phone, issue, allergies in patient_data:
            p, _ = Patient.objects.get_or_create(phone=phone, defaults={
                'full_name': name, 'age': age, 'date_of_birth': dob,
                'blood_type': bt, 'weight': wt, 'issue': issue, 'allergies': allergies,
            })
            patients.append(p)

        self.stdout.write('  ✅ Patients created')

        # ── Appointments ───────────────────────────────────────────────────────
        today = timezone.now().date()
        appointment_configs = [
            (patients[0], doctors[1], today, time(9, 0), 'Diabetes management', 'waiting'),
            (patients[1], doctors[2], today, time(9, 30), 'Chest pain evaluation', 'checked_in'),
            (patients[2], doctors[0], today, time(10, 0), 'Fever and cold', 'waiting'),
            (patients[3], doctors[2], today, time(10, 30), 'BP monitoring', 'completed'),
            (patients[4], doctors[1], today, time(11, 0), 'Thyroid checkup', 'waiting'),
            (patients[5], doctors[0], today, time(11, 30), 'Joint pain review', 'waiting'),
            (patients[6], doctors[0], today, time(12, 0), 'Routine checkup', 'checked_in'),
            (patients[7], doctors[1], today, time(14, 0), 'Diabetes and cholesterol review', 'waiting'),
            (patients[8], doctors[0], today, time(14, 30), 'Migraine consultation', 'waiting'),
            (patients[9], doctors[2], today, time(15, 0), 'Cardiac evaluation', 'waiting'),
        ]

        appointments = []
        for pat, doc, appt_date, appt_time, issue, status in appointment_configs:
            a, _ = Appointment.objects.get_or_create(
                patient=pat, doctor=doc, date=appt_date, defaults={
                    'time': appt_time, 'issue': issue, 'status': status,
                }
            )
            appointments.append(a)

        # Past appointments
        past_date = today - timedelta(days=7)
        past_configs = [
            (patients[3], doctors[2], past_date, time(9, 0), 'Initial BP evaluation', 'completed'),
            (patients[0], doctors[1], past_date, time(10, 0), 'Diabetes follow-up', 'completed'),
        ]
        past_appts = []
        for pat, doc, appt_date, appt_time, issue, status in past_configs:
            a, _ = Appointment.objects.get_or_create(
                patient=pat, doctor=doc, date=appt_date, defaults={
                    'time': appt_time, 'issue': issue, 'status': status,
                }
            )
            past_appts.append(a)

        self.stdout.write('  ✅ Appointments created')

        # ── Prescriptions & Bills ──────────────────────────────────────────────
        rx_data = [
            (patients[3], doctors[2], past_appts[0],
             'Tab Amlodipine 5mg - Once daily\nTab Telmisartan 40mg - Once daily\nSalt-restricted diet advised', 600),
            (patients[0], doctors[1], past_appts[1],
             'Tab Metformin 500mg - Twice daily with meals\nTab Glimepiride 1mg - Once daily before breakfast\nBlood sugar monitoring twice weekly', 700),
        ]

        for pat, doc, appt, text, fee in rx_data:
            if not Prescription.objects.filter(patient=pat, appointment=appt).exists():
                rx = Prescription.objects.create(patient=pat, doctor=doc, appointment=appt, text=text)
                Bill.objects.get_or_create(prescription=rx, defaults={
                    'patient': pat, 'doctor': doc, 'consultation_fee': fee, 'status': 'paid',
                })

        self.stdout.write('  ✅ Prescriptions and bills created')
        self.stdout.write(self.style.SUCCESS('\n🎉 Demo data seeded successfully!'))
        self.stdout.write('\n  📋 Login credentials:')
        self.stdout.write('     Frontdesk: frontdesk@hms.com / demo1234')
        self.stdout.write('     Doctor 1:  doctor1@hms.com / demo1234  (Dr. Arjun Sharma - General)')
        self.stdout.write('     Doctor 2:  doctor2@hms.com / demo1234  (Dr. Priya Nair - Diabetologist)')
        self.stdout.write('     Doctor 3:  doctor3@hms.com / demo1234  (Dr. Rahul Mehta - Cardiologist)')
