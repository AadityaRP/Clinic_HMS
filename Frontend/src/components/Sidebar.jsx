import { NavLink, useNavigate } from 'react-router-dom';
import SentiAIButton from './SentiAIButton';

const icons = {
    dashboard: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    patients: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    appointments: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    prescriptions: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    billing: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
};

export default function Sidebar({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const frontdeskNav = [
        { to: '/frontdesk/dashboard', label: 'Dashboard', icon: icons.dashboard },
        { to: '/frontdesk/appointments', label: 'Appointments', icon: icons.appointments },
        { to: '/frontdesk/patients', label: 'Patients', icon: icons.patients },
        { to: '/frontdesk/bills', label: 'Bill', icon: icons.billing },
    ];

    const doctorNav = [
        { to: '/doctor/dashboard', label: 'Dashboard', icon: icons.dashboard },
        { to: '/doctor/patients', label: 'My Patients', icon: icons.patients },
        { to: '/doctor/prescriptions', label: 'Prescriptions', icon: icons.prescriptions },
    ];

    const navItems = user?.role === 'doctor' ? doctorNav : frontdeskNav;
    const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U' : 'U';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-title">🏥 HMS</div>
                <div className="sidebar-logo-subtitle">Hospital Management</div>
            </div>

            <div className="sidebar-role-badge">
                {user?.role === 'doctor' ? '👨‍⚕️ Doctor' : '🖥️ Front Desk'}
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}

                {user?.role === 'doctor' && (
                    <div style={{ padding: '16px 20px' }}>
                        <SentiAIButton label="SENTI AI" />
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div>
                        <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
                        <div className="sidebar-user-email">{user?.email}</div>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>← Logout</button>
            </div>
        </aside>
    );
}
