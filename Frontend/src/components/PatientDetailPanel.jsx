import SentiAIButton from './SentiAIButton';

export default function PatientDetailPanel({ patient, appointment, onClose }) {
    if (!patient) return null;

    const initials = patient.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hr = parseInt(h);
        return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="detail-panel">
            <div className="detail-panel-header">
                <button className="detail-panel-close" onClick={onClose} title="Close">✕</button>
                <div className="detail-panel-avatar">{initials}</div>
                <div className="detail-panel-name">{patient.full_name}</div>
                <div className="detail-panel-id">ID: {patient.patient_id}</div>
            </div>

            <div className="detail-panel-body">
                <div className="detail-section-title">Patient Info</div>

                <div className="detail-row">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">{patient.age} yrs</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">DOB</span>
                    <span className="detail-value">{formatDate(patient.date_of_birth)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Blood Type</span>
                    <span className="detail-value">
                        {patient.blood_type ? (
                            <span className="tag tag-blood">{patient.blood_type}</span>
                        ) : '—'}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Weight</span>
                    <span className="detail-value">{patient.weight ? `${patient.weight} kg` : '—'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{patient.phone}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Last Visit</span>
                    <span className="detail-value">{formatDate(patient.last_visit)}</span>
                </div>

                {patient.allergies && (
                    <div className="detail-row">
                        <span className="detail-label">Allergies</span>
                        <span className="detail-value">
                            <span className="tag tag-allergy">⚠ {patient.allergies}</span>
                        </span>
                    </div>
                )}

                {appointment && (
                    <>
                        <div className="detail-section-title" style={{ marginTop: 20 }}>Appointment</div>
                        <div className="detail-row">
                            <span className="detail-label">Token #</span>
                            <span className="detail-value">#{appointment.token_number}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Time</span>
                            <span className="detail-value">{formatTime(appointment.time)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status</span>
                            <span className="detail-value">
                                <span className={`badge badge-${appointment.status}`}>
                                    {appointment.status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Doctor</span>
                            <span className="detail-value">{appointment.doctor_detail?.name || '—'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Issue</span>
                            <span className="detail-value" style={{ maxWidth: 180, textAlign: 'right', lineHeight: 1.4 }}>
                                {appointment.issue || '—'}
                            </span>
                        </div>
                    </>
                )}

                {patient.issue && !appointment && (
                    <div className="detail-row">
                        <span className="detail-label">Chief Complaint</span>
                        <span className="detail-value" style={{ maxWidth: 180, textAlign: 'right', lineHeight: 1.4 }}>
                            {patient.issue}
                        </span>
                    </div>
                )}

                <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                        SENTI AI VOICE
                    </div>
                    <SentiAIButton label="SENTI AI" />
                </div>
            </div>
        </div>
    );
}
