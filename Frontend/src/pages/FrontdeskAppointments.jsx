import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function FrontdeskAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editAppt, setEditAppt] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [toast, setToast] = useState(null);

    const defaultForm = { patient: '', doctor: '', date: new Date().toISOString().split('T')[0], time: '09:00', issue: '' };
    const [form, setForm] = useState(defaultForm);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAll = useCallback(async () => {
        try {
            const [appRes, docRes] = await Promise.all([
                api.get('/appointments/'),
                api.get('/doctors/'),
            ]);
            setAppointments(appRes.data);
            setDoctors(docRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        const t = setTimeout(async () => {
            if (patientSearch.length > 1) {
                const res = await api.get(`/patients/?q=${patientSearch}`);
                setPatients(res.data);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [patientSearch]);

    const handleOpenForm = (appt = null) => {
        if (appt) {
            setEditAppt(appt);
            setForm({
                patient: appt.patient,
                doctor: appt.doctor,
                date: appt.date,
                time: appt.time,
                issue: appt.issue,
            });
        } else {
            setEditAppt(null);
            setForm(defaultForm);
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editAppt) {
                const res = await api.put(`/appointments/${editAppt.id}/`, form);
                setAppointments(prev => prev.map(a => a.id === editAppt.id ? res.data : a));
                showToast('✅ Appointment updated!');
            } else {
                const res = await api.post('/appointments/', form);
                setAppointments(prev => [res.data, ...prev]);
                showToast('✅ Appointment created!');
            }
            setShowForm(false);
        } catch (e) {
            showToast('❌ Failed. Please check the form.', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {appointments.length} total appointments
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenForm()}>+ New Appointment</button>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <span className="section-title">📅 All Appointments</span>
                </div>
                {loading ? (
                    <div className="loading"><div className="spinner"></div>Loading...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-text">No appointments yet</div></div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Issue</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--teal-600)' }}>#{a.token_number}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{a.patient_detail?.full_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient_detail?.patient_id}</div>
                                    </td>
                                    <td style={{ fontSize: 13 }}>{a.doctor_detail?.name || '—'}</td>
                                    <td style={{ fontSize: 13 }}>{formatDate(a.date)}</td>
                                    <td style={{ fontSize: 13 }}>{formatTime(a.time)}</td>
                                    <td style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.issue}</td>
                                    <td><span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenForm(a)}>✏️ Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <span className="modal-title">{editAppt ? '✏️ Edit Appointment' : '+ New Appointment'}</span>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Search & Select Patient *</label>
                                <input
                                    className="form-control"
                                    placeholder="Type patient name, phone or ID..."
                                    value={patientSearch}
                                    onChange={e => setPatientSearch(e.target.value)}
                                />
                                {patients.length > 0 && (
                                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, marginTop: 4, maxHeight: 160, overflowY: 'auto' }}>
                                        {patients.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => { setForm(f => ({ ...f, patient: p.id })); setPatientSearch(p.full_name); setPatients([]); }}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                    borderBottom: '1px solid #f1f5f9',
                                                    background: form.patient === p.id ? 'var(--teal-50)' : '#fff',
                                                }}
                                            >
                                                <strong>{p.full_name}</strong> — {p.patient_id} — {p.phone}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign Doctor *</label>
                                <select className="form-control" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} required>
                                    <option value="">-- Select Doctor --</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time *</label>
                                    <input className="form-control" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Issue / Reason for Visit *</label>
                                <textarea className="form-control" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} required placeholder="Describe the reason for appointment..." style={{ minHeight: 80 }} />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editAppt ? '✅ Update' : '✅ Create Appointment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
