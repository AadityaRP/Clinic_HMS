import Sidebar from './Sidebar';

export default function Layout({ user, title, subtitle, children }) {
    return (
        <div className="app-layout">
            <Sidebar user={user} />
            <div className="main-content">
                <div className="topbar">
                    <div>
                        <div className="topbar-title">{title}</div>
                        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
                    </div>
                    <div className="topbar-date">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className="page-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
