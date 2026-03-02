import { useState, useEffect } from 'react';
import api from '../api';
import PatientDetailPanel from '../components/PatientDetailPanel';

const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

    const fetchToday = async () => {
        try {
            // Get the doctor profile first
            const docRes = await api.get('/doctors/');
            const myDoc = docRes.data.find(d => d.user.id === user.id);
            if (!myDoc) return;
            const res = await api.get(`/appointments/?today=1&doctor=${myDoc.id}`);
            setAppointments(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchToday(); }, []);

    const stats = {
        total: appointments.length,
        waiting: appointments.filter(a => ['waiting', 'checked_in'].includes(a.status)).length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stats-grid">
                    {[
                        { label: "Today's Patients", value: stats.total, icon: '👥', color: 'teal' },
                        { label: 'Waiting / In Progress', value: stats.waiting, icon: '⏳', color: 'orange' },
                        { label: 'Completed', value: stats.completed, icon: '✅', color: 'green' },
                    ].map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className={`stat-icon ${s.color}`} style={{ fontSize: 20 }}>{s.icon}</div>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <span className="section-title">📋 My Patients Today</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </span>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div>Loading...</div>
                    ) : appointments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🗓️</div>
                            <div className="empty-state-text">No patients scheduled today</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr><th>#</th><th>Patient</th><th>Age</th><th>Time</th><th>Issue</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {appointments.map(a => (
                                    <tr key={a.id} onClick={() => setSelected(a)} className={selected?.id === a.id ? 'selected' : ''}>
                                        <td style={{ fontWeight: 700, color: 'var(--teal-600)' }}>#{a.token_number}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{a.patient_detail?.full_name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient_detail?.patient_id}</div>
                                        </td>
                                        <td>{a.patient_detail?.age} yrs</td>
                                        <td>{formatTime(a.time)}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{a.issue}</td>
                                        <td><span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selected && (
                <PatientDetailPanel patient={selected.patient_detail} appointment={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}
