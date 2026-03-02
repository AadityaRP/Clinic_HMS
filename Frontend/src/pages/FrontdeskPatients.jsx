import { useState, useEffect } from 'react';
import api from '../api';
import PatientDetailPanel from '../components/PatientDetailPanel';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function FrontdeskPatients() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        full_name: '', age: '', date_of_birth: '', blood_type: '',
        weight: '', phone: '', issue: '', allergies: '',
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPatients = async (q = '') => {
        try {
            const res = await api.get(`/patients/?q=${q}`);
            setPatients(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPatients(); }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchPatients(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchHistory = async (id) => {
        setHistoryLoading(true);
        try {
            const res = await api.get(`/patients/${id}/history/`);
            setHistory(res.data);
        } catch (e) { console.error(e); }
        finally { setHistoryLoading(false); }
    };

    const handleSelectPatient = (p) => {
        setSelected(p);
        fetchHistory(p.id);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, age: parseInt(form.age) };
            if (!payload.weight) delete payload.weight;
            const res = await api.post('/patients/', payload);
            setPatients(prev => [res.data, ...prev]);
            setShowForm(false);
            setForm({ full_name: '', age: '', date_of_birth: '', blood_type: '', weight: '', phone: '', issue: '', allergies: '' });
            showToast(`✅ Patient ${res.data.full_name} registered! ID: ${res.data.patient_id}`);
        } catch (e) {
            showToast('❌ Registration failed. Please check the form.', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder="Search by name, phone, or patient ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginLeft: 16 }}>
                        + Register New Patient
                    </button>
                </div>

                {/* Patient List */}
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-title">👥 Patient List ({patients.length})</span>
                    </div>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div>Loading...</div>
                    ) : patients.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-text">No patients found</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Blood</th>
                                    <th>Phone</th>
                                    <th>Last Visit</th>
                                    <th>Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.id} onClick={() => handleSelectPatient(p)} className={selected?.id === p.id ? 'selected' : ''}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--teal-600)', fontWeight: 700 }}>{p.patient_id}</td>
                                        <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                                        <td>{p.age} yrs</td>
                                        <td>{p.blood_type ? <span className="tag tag-blood">{p.blood_type}</span> : '—'}</td>
                                        <td>{p.phone}</td>
                                        <td>{formatDate(p.last_visit)}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(p.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Visit History */}
                {selected && (
                    <div className="section-card" style={{ marginTop: 20 }}>
                        <div className="section-header">
                            <span className="section-title">📁 Visit History — {selected.full_name}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
                        </div>
                        {historyLoading ? (
                            <div className="loading"><div className="spinner"></div></div>
                        ) : history.length === 0 ? (
                            <div className="empty-state" style={{ padding: 24 }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No visit history found.</div>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr><th>Date</th><th>Doctor</th><th>Issue</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {history.map(h => (
                                        <tr key={h.id}>
                                            <td>{formatDate(h.date)}</td>
                                            <td>{h.doctor_detail?.name || '—'}</td>
                                            <td style={{ maxWidth: 200 }}>{h.issue}</td>
                                            <td><span className={`badge badge-${h.status}`}>{h.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Patient Panel */}
            {selected && (
                <PatientDetailPanel patient={selected} onClose={() => setSelected(null)} />
            )}

            {/* Register Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <span className="modal-title">Register New Patient</span>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleRegister}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-control" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Patient full name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="10-digit mobile number" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Age *</label>
                                    <input className="form-control" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required min="0" max="150" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth *</label>
                                    <input className="form-control" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Blood Type</label>
                                    <select className="form-control" value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })}>
                                        <option value="">-- Select --</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weight (kg)</label>
                                    <input className="form-control" type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 65.5" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purpose of Visit / Issue Description *</label>
                                <textarea className="form-control" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} required placeholder="Describe the patient's chief complaint or reason for visit..." style={{ minHeight: 80 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Known Allergies</label>
                                <input className="form-control" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Sulfa drugs (leave blank if none)" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">✅ Register Patient</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
