import { useState, useEffect } from 'react';
import api from '../api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function FrontdeskBills() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await api.get('/billing/');
                setBills(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchBills();
    }, []);

    const toggleStatus = async (bill) => {
        const newStatus = bill.status === 'pending' ? 'paid' : 'pending';
        try {
            await api.put(`/billing/${bill.id}/`, { status: newStatus });
            setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: newStatus } : b));
            showToast(`✅ Bill marked as ${newStatus}`);
        } catch (e) {
            showToast('❌ Failed to update bill status', 'error');
        }
    };

    const filtered = filter === 'all' ? bills : bills.filter(b => b.status === filter);
    const pendingTotal = bills.filter(b => b.status === 'pending').reduce((s, b) => s + parseFloat(b.consultation_fee || 0), 0);
    const paidTotal = bills.filter(b => b.status === 'paid').reduce((s, b) => s + parseFloat(b.consultation_fee || 0), 0);

    return (
        <div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { label: 'Total Bills', value: bills.length, icon: '🧾', color: 'teal' },
                    { label: 'Pending Amount', value: `₹${pendingTotal.toFixed(0)}`, icon: '⏳', color: 'orange' },
                    { label: 'Collected Amount', value: `₹${paidTotal.toFixed(0)}`, icon: '💰', color: 'green' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className={`stat-icon ${s.color}`} style={{ fontSize: 20 }}>{s.icon}</div>
                        <div>
                            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="section-card">
                <div className="section-header">
                    <span className="section-title">💳 Billing Records</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['all', 'pending', 'paid'].map(f => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner"></div>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🧾</div>
                        <div className="empty-state-text">No bills found</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Bills are auto-generated when a doctor submits a prescription.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Prescription</th>
                                <th>Consultation Fee</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(b => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--teal-600)' }}>#{b.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{b.patient_detail?.full_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.patient_detail?.patient_id}</div>
                                    </td>
                                    <td style={{ fontSize: 13 }}>{b.doctor_detail?.name || '—'}</td>
                                    <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {b.prescription_text || '—'}
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--teal-700)', fontSize: 15 }}>
                                        ₹{parseFloat(b.consultation_fee).toFixed(0)}
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(b.created_at)}</td>
                                    <td>
                                        <span className={`badge badge-${b.status}`}>
                                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${b.status === 'pending' ? 'btn-success' : 'btn-secondary'}`}
                                            onClick={() => toggleStatus(b)}
                                        >
                                            {b.status === 'pending' ? '✅ Mark Paid' : '↩ Pending'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
