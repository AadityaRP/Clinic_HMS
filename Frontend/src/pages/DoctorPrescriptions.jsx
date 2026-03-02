import { useState, useEffect } from 'react';
import api from '../api';
import SentiAIButton from '../components/SentiAIButton';

export default function DoctorPrescriptions() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [form, setForm] = useState({ text: '', consultation_fee: '500' });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [submitted, setSubmitted] = useState([]);

    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const docRes = await api.get('/doctors/');
                const myDoc = docRes.data.find(d => d.user.id === user.id);
                if (!myDoc) return;
                const res = await api.get(`/appointments/?doctor=${myDoc.id}`);
                setAppointments(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchPatients();
    }, []);

    const handleSelectAppt = (appt) => {
        setSelectedAppt(appt);
        setForm({ text: '', consultation_fee: '500' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppt) return;
        setSubmitting(true);
        try {
            const docRes = await api.get('/doctors/');
            const myDoc = docRes.data.find(d => d.user.id === user.id);

            await api.post('/prescriptions/', {
                patient: selectedAppt.patient,
                doctor: myDoc?.id,
                appointment: selectedAppt.id,
                text: form.text,
                consultation_fee: parseFloat(form.consultation_fee),
            });

            // Mark as completed locally
            setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: 'completed' } : a));
            setSubmitted(prev => [...prev, selectedAppt.id]);
            setSelectedAppt(null);
            setForm({ text: '', consultation_fee: '500' });
            showToast('✅ Prescription submitted! Bill generated for frontdesk.');
        } catch (e) {
            showToast('❌ Failed to submit prescription.', 'error');
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const pending = appointments.filter(a => a.status !== 'completed' && !submitted.includes(a.id));
    const done = appointments.filter(a => a.status === 'completed' || submitted.includes(a.id));

    return (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Patient list */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-title">⏳ Pending Prescriptions ({pending.length})</span>
                    </div>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : pending.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}>
                            <div className="empty-state-icon">🎉</div>
                            <div className="empty-state-text">All patients attended!</div>
                        </div>
                    ) : (
                        <div style={{ padding: 12 }}>
                            {pending.map(a => (
                                <div
                                    key={a.id}
                                    className={`patient-select-card ${selectedAppt?.id === a.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectAppt(a)}
                                >
                                    <div className="patient-select-avatar">
                                        {a.patient_detail?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.patient_detail?.full_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {a.patient_detail?.patient_id} • {a.patient_detail?.age} yrs • Token #{a.token_number}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{a.issue}</div>
                                    </div>
                                    <span className={`badge badge-${a.status}`}>
                                        {a.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {done.length > 0 && (
                    <div className="section-card" style={{ marginTop: 20 }}>
                        <div className="section-header">
                            <span className="section-title">✅ Completed ({done.length})</span>
                        </div>
                        <div style={{ padding: 12 }}>
                            {done.map(a => (
                                <div key={a.id} className="patient-select-card" style={{ opacity: 0.6, cursor: 'default' }}>
                                    <div className="patient-select-avatar" style={{ background: 'var(--teal-100)' }}>
                                        {a.patient_detail?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.patient_detail?.full_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.issue}</div>
                                    </div>
                                    <span className="badge badge-completed">Completed</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Prescription form */}
            <div style={{ width: 400, flexShrink: 0 }}>
                {selectedAppt ? (
                    <div className="prescription-form">
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                                📝 Write Prescription
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Patient: <strong>{selectedAppt.patient_detail?.full_name}</strong>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Issue: {selectedAppt.issue}
                            </div>
                            {selectedAppt.patient_detail?.allergies && (
                                <div style={{ marginTop: 8, padding: '6px 10px', background: '#fee2e2', borderRadius: 6, fontSize: 12, color: '#991b1b' }}>
                                    ⚠️ Allergies: {selectedAppt.patient_detail?.allergies}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Prescription Text *</label>
                                <textarea
                                    className="form-control"
                                    value={form.text}
                                    onChange={e => setForm({ ...form, text: e.target.value })}
                                    required
                                    placeholder={`Medication name - Dose - Frequency\ne.g.:\nTab Paracetamol 500mg - Twice daily × 5 days\nSyrup Cetirizine 5ml - Once at bedtime\n\nAdvice: Rest for 2 days, drink warm fluids`}
                                    style={{ minHeight: 180, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Consultation Fee (₹) *</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={form.consultation_fee}
                                    onChange={e => setForm({ ...form, consultation_fee: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginTop: 20, marginBottom: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                                <SentiAIButton label="SENTI AI ASSISTANT" />
                            </div>

                            <div className="form-actions" style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedAppt(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? '⏳ Submitting...' : '✅ Submit & Generate Bill'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div style={{
                        background: '#fff',
                        border: '2px dashed var(--border)',
                        borderRadius: 14,
                        padding: 40,
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Select a patient</div>
                        <div style={{ fontSize: 13, marginTop: 6 }}>to write and submit their prescription</div>
                    </div>
                )}
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
