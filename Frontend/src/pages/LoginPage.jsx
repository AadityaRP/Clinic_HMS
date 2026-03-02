import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fillDemo = (email) => setForm({ email, password: 'demo1234' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login/', form);
            const { access, user } = res.data;
            localStorage.setItem('hms_token', access);
            localStorage.setItem('hms_user', JSON.stringify(user));
            if (user.role === 'doctor') navigate('/doctor/dashboard');
            else navigate('/frontdesk/dashboard');
        } catch {
            setError('Invalid email or password. Try the demo credentials below.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🏥</div>
                    <div className="login-title">MediCare HMS</div>
                    <div className="login-subtitle">Hospital Management System</div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-control"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                        {loading ? '⏳ Signing in...' : '→ Sign In'}
                    </button>
                </form>

                <div className="login-demo-creds">
                    <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--teal-800)' }}>🔑 Demo Credentials (click to fill)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                            ['frontdesk@hms.com', '🖥️ Frontdesk — Sarah Johnson'],
                            ['doctor1@hms.com', '👨‍⚕️ Dr. Arjun Sharma (General)'],
                            ['doctor2@hms.com', '👩‍⚕️ Dr. Priya Nair (Diabetologist)'],
                            ['doctor3@hms.com', '❤️ Dr. Rahul Mehta (Cardiologist)'],
                        ].map(([email, label]) => (
                            <button
                                key={email}
                                type="button"
                                onClick={() => fillDemo(email)}
                                style={{
                                    padding: '6px 10px',
                                    background: 'white',
                                    border: '1px solid var(--teal-200)',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    color: 'var(--teal-700)',
                                    textAlign: 'left',
                                    fontWeight: 500,
                                    transition: 'background 0.15s',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Password: <strong>demo1234</strong> for all accounts</p>
                </div>
            </div>
        </div>
    );
}
