import { useState, useEffect } from 'react';
import api from '../api';
import PatientDetailPanel from '../components/PatientDetailPanel';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function DoctorPatients() {
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [myDoctorId, setMyDoctorId] = useState(null);
    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

    useEffect(() => {
        const fetchMyPatients = async () => {
            try {
                const docRes = await api.get('/doctors/');
                const myDoc = docRes.data.find(d => d.user.id === user.id);
                if (!myDoc) return;
                setMyDoctorId(myDoc.id);
                const [apptRes, rxRes] = await Promise.all([
                    api.get(`/appointments/?doctor=${myDoc.id}`),
                    api.get(`/prescriptions/?doctor=${myDoc.id}`),
                ]);
                setAppointments(apptRes.data);
                setPrescriptions(rxRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchMyPatients();
    }, []);

    // Unique patients from appointments
    const uniquePatients = [];
    const seen = new Set();
    for (const a of appointments) {
        if (!seen.has(a.patient)) {
            seen.add(a.patient);
            uniquePatients.push({ ...a.patient_detail, latestAppt: a });
        }
    }

    const patientPrescriptions = (patientId) => prescriptions.filter(rx => rx.patient === patientId);

    return (
        <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-title">👥 My Patients ({uniquePatients.length})</span>
                    </div>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div>Loading...</div>
                    ) : uniquePatients.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-text">No patients assigned yet</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr><th>Patient</th><th>Age</th><th>Blood</th><th>Issue</th><th>Last Visit</th><th>Prescriptions</th></tr>
                            </thead>
                            <tbody>
                                {uniquePatients.map(p => {
                                    const rxs = patientPrescriptions(p.id);
                                    return (
                                        <tr key={p.id} onClick={() => setSelected(p)} className={selected?.id === p.id ? 'selected' : ''}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.patient_id}</div>
                                            </td>
                                            <td>{p.age} yrs</td>
                                            <td>{p.blood_type ? <span className="tag tag-blood">{p.blood_type}</span> : '—'}</td>
                                            <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.latestAppt?.issue || p.issue}
                                            </td>
                                            <td>{formatDate(p.last_visit)}</td>
                                            <td>
                                                <span style={{ fontSize: 12, color: 'var(--teal-600)', fontWeight: 600 }}>
                                                    {rxs.length} Rx
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {selected && (
                    <div className="section-card" style={{ marginTop: 20 }}>
                        <div className="section-header">
                            <span className="section-title">📋 Previous Prescriptions — {selected.full_name}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
                        </div>
                        {patientPrescriptions(selected.id).length === 0 ? (
                            <div className="empty-state" style={{ padding: 24 }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No prescriptions yet for this patient.</div>
                            </div>
                        ) : (
                            <div style={{ padding: 16 }}>
                                {patientPrescriptions(selected.id).map(rx => (
                                    <div key={rx.id} style={{
                                        padding: 16,
                                        border: '1px solid var(--border)',
                                        borderRadius: 10,
                                        marginBottom: 12,
                                        background: '#f8fafc',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-700)' }}>
                                                📅 {formatDate(rx.created_at)}
                                            </span>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rx #{rx.id}</span>
                                        </div>
                                        <pre style={{ fontFamily: 'inherit', fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                                            {rx.text}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selected && (
                <PatientDetailPanel patient={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}
