import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';

// Frontdesk pages
import FrontdeskDashboard from './pages/FrontdeskDashboard';
import FrontdeskPatients from './pages/FrontdeskPatients';
import FrontdeskAppointments from './pages/FrontdeskAppointments';
import FrontdeskBills from './pages/FrontdeskBills';

// Doctor pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPrescriptions from './pages/DoctorPrescriptions';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('hms_user') || 'null'); }
  catch { return null; }
};

function ProtectedRoute({ user, children, role }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/frontdesk/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(readUser);

  // Re-read user whenever localStorage changes (after login/logout in same tab)
  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener('storage', onStorage);
    const timer = setInterval(() => setUser(readUser()), 300);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(timer); };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Default redirect */}
        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/frontdesk/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />

        {/* ── Frontdesk ─────────────────────────────────────── */}
        <Route path="/frontdesk/dashboard" element={
          <ProtectedRoute user={user} role="frontdesk">
            <Layout user={user} title="Dashboard" subtitle="Today's overview">
              <FrontdeskDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/patients" element={
          <ProtectedRoute user={user} role="frontdesk">
            <Layout user={user} title="Patients" subtitle="Register and manage patients">
              <FrontdeskPatients />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/appointments" element={
          <ProtectedRoute user={user} role="frontdesk">
            <Layout user={user} title="Appointments" subtitle="Schedule and manage appointments">
              <FrontdeskAppointments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/bills" element={
          <ProtectedRoute user={user} role="frontdesk">
            <Layout user={user} title="Billing" subtitle="Patient billing and payment records">
              <FrontdeskBills />
            </Layout>
          </ProtectedRoute>
        } />

        {/* ── Doctor ────────────────────────────────────────── */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute user={user} role="doctor">
            <Layout user={user} title="My Dashboard" subtitle="Today's patient schedule">
              <DoctorDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute user={user} role="doctor">
            <Layout user={user} title="My Patients" subtitle="All assigned patients and history">
              <DoctorPatients />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute user={user} role="doctor">
            <Layout user={user} title="Prescriptions" subtitle="Write and submit patient prescriptions">
              <DoctorPrescriptions />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
