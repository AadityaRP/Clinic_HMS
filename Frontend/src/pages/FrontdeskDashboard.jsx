import { useState, useEffect } from 'react';
import api from '../api';
import PatientDetailPanel from '../components/PatientDetailPanel';

const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function FrontdeskDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const fetchToday = async () => {
        try {
            const res = await api.get('/appointments/?today=1');
            setAppointments(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchToday(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}/`, { status });
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            if (selected?.id === id) setSelected(s => ({ ...s, status }));
        } catch (e) { console.error(e); }
    };

    const stats = {
        total: appointments.length,
        waiting: appointments.filter(a => a.status === 'waiting').length,
        checkedIn: appointments.filter(a => a.status === 'checked_in').length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stats-grid">
                    {[
                        { label: 'Total Patients Today', value: stats.total, icon: '👥', color: 'teal' },
                        { label: 'Waiting', value: stats.waiting, icon: '⏳', color: 'orange' },
                        { label: 'Checked In', value: stats.checkedIn, icon: '🔵', color: 'blue' },
                        { label: 'Completed', value: stats.completed, icon: '✅', color: 'green' },
                    ].map(s => (
                        <div className="stat-card" key={s.label} style={{ gridColumn: s.label === 'Total Patients Today' ? 'span 1' : 'auto' }}>
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
                        <span className="section-title">📋 Today's Patient Queue</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{today}</span>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div>Loading...</div>
                    ) : appointments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🗓️</div>
                            <div className="empty-state-text">No appointments today</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Patient</th>
                                    <th>Age</th>
                                    <th>Doctor</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(a => (
                                    <tr
                                        key={a.id}
                                        onClick={() => setSelected(a)}
                                        className={selected?.id === a.id ? 'selected' : ''}
                                    >
                                        <td style={{ fontWeight: 700, color: 'var(--teal-600)' }}>#{a.token_number}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{a.patient_detail?.full_name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient_detail?.patient_id}</div>
                                        </td>
                                        <td>{a.patient_detail?.age} yrs</td>
                                        <td>{a.doctor_detail?.name || '—'}</td>
                                        <td>{formatTime(a.time)}</td>
                                        <td>
                                            <span className={`badge badge-${a.status}`}>
                                                {a.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <select
                                                value={a.status}
                                                onChange={e => updateStatus(a.id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 6,
                                                    border: '1px solid var(--border)',
                                                    fontSize: 12,
                                                    cursor: 'pointer',
                                                    background: '#fff',
                                                }}
                                            >
                                                <option value="waiting">Waiting</option>
                                                <option value="checked_in">Checked In</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selected && (
                <PatientDetailPanel
                    patient={selected.patient_detail}
                    appointment={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
