import { useConversation } from '@elevenlabs/react';
import { useState, useCallback } from 'react';
import api from '../api';

export default function SentiAIButton({ agentId = 'agent_1001kjvtsa28efbah9rsmzjc4352', label = 'SENTI AI', style = {} }) {
    const [isHovered, setIsHovered] = useState(false);

    const conversation = useConversation({
        onConnect: () => console.log('Senti AI Connected'),
        onDisconnect: () => console.log('Senti AI Disconnected'),
        onError: (err) => console.error('Senti AI Error:', err),

        // ── CLIENT TOOLS: let the agent fetch live data from HMS ─────────────
        clientTools: {

            // 1. Dashboard summary for the logged-in doctor
            get_dashboard_summary: async () => {
                try {
                    const [apptRes, doctorRes] = await Promise.all([
                        api.get('/appointments/?today=true'),
                        api.get('/doctors/'),
                    ]);
                    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
                    const myDoc = doctorRes.data.find(d => d.user.id === user.id);
                    const mine = myDoc ? apptRes.data.filter(a => a.doctor === myDoc.id) : apptRes.data;
                    const pending = mine.filter(a => a.status !== 'completed').length;
                    const completed = mine.filter(a => a.status === 'completed').length;
                    return `Today's dashboard: ${mine.length} total appointments. ${pending} pending, ${completed} completed.`;
                } catch {
                    return 'Could not fetch dashboard summary.';
                }
            },

            // 2. Full appointment list for today (this doctor only)
            get_today_appointments: async () => {
                try {
                    const [apptRes, doctorRes] = await Promise.all([
                        api.get('/appointments/?today=true'),
                        api.get('/doctors/'),
                    ]);
                    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
                    const myDoc = doctorRes.data.find(d => d.user.id === user.id);
                    const appts = myDoc ? apptRes.data.filter(a => a.doctor === myDoc.id) : apptRes.data;
                    if (!appts.length) return 'No appointments scheduled for today.';
                    return appts.map(a =>
                        `Token ${a.token_number}: ${a.patient_detail?.full_name}, ${a.patient_detail?.age} yrs — ${a.issue || 'No issue stated'} [${a.status}]`
                    ).join('. ');
                } catch {
                    return "Could not fetch today's appointments.";
                }
            },

            // 3. List all patients in the system
            get_all_patients: async () => {
                try {
                    const res = await api.get('/patients/');
                    if (!res.data.length) return 'No patients found.';
                    return res.data.map(p =>
                        `${p.full_name} (ID: ${p.patient_id}), Age: ${p.age}, Blood: ${p.blood_type || 'unknown'}`
                    ).join('. ');
                } catch {
                    return 'Could not fetch patient list.';
                }
            },

            // 4. Detailed info on a specific patient by name or patient ID
            get_patient_details: async ({ name_or_id }) => {
                try {
                    const res = await api.get(`/patients/?q=${encodeURIComponent(name_or_id)}`);
                    if (!res.data.length) return `No patient found matching "${name_or_id}".`;
                    const p = res.data[0];
                    return `Patient: ${p.full_name}, ID: ${p.patient_id}, Age: ${p.age}, DOB: ${p.date_of_birth}, Blood type: ${p.blood_type || 'not recorded'}, Weight: ${p.weight ? p.weight + ' kg' : 'not recorded'}, Phone: ${p.phone}, Allergies: ${p.allergies || 'none'}, Chief complaint: ${p.issue || 'none'}.`;
                } catch {
                    return 'Could not fetch patient details.';
                }
            },

            // 5. Prescriptions written by the currently logged-in doctor
            get_doctor_prescriptions: async () => {
                try {
                    const doctorRes = await api.get('/doctors/');
                    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
                    const myDoc = doctorRes.data.find(d => d.user.id === user.id);
                    if (!myDoc) return 'Could not identify the current doctor.';
                    const res = await api.get(`/prescriptions/?doctor=${myDoc.id}`);
                    if (!res.data.length) return 'No prescriptions found.';
                    return res.data.map(p =>
                        `Patient: ${p.patient_detail?.full_name}, Date: ${p.created_at?.slice(0, 10)}, Treatment: ${p.text?.slice(0, 120)}`
                    ).join('. ');
                } catch {
                    return 'Could not fetch prescriptions.';
                }
            },

            // 6. Prescriptions for a specific patient by name or ID
            get_patient_prescriptions: async ({ name_or_id }) => {
                try {
                    const pRes = await api.get(`/patients/?q=${encodeURIComponent(name_or_id)}`);
                    if (!pRes.data.length) return `No patient found matching "${name_or_id}".`;
                    const patient = pRes.data[0];
                    const res = await api.get(`/prescriptions/?patient=${patient.id}`);
                    if (!res.data.length) return `No prescriptions found for ${patient.full_name}.`;
                    return res.data.map(p =>
                        `Date: ${p.created_at?.slice(0, 10)}: ${p.text}`
                    ).join('. ');
                } catch {
                    return `Could not fetch prescriptions for "${name_or_id}".`;
                }
            },
        },
        // ─────────────────────────────────────────────────────────────────────
    });

    const isConnected = conversation.status === 'connected';

    const handleMouseEnter = useCallback(async () => {
        setIsHovered(true);
        if (conversation.status === 'connected' || conversation.status === 'connecting') return;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await conversation.startSession({ agentId });
        } catch (error) {
            console.error('Failed to start Senti AI session:', error);
        }
    }, [conversation, agentId]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const stopSession = async () => {
        await conversation.endSession();
    };

    const gradient = isConnected
        ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
        : 'linear-gradient(135deg, #0d9488, #0f766e)';

    return (
        <div
            style={{ marginTop: 10, position: 'relative', ...style }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                onClick={isConnected ? stopSession : handleMouseEnter}
                className="btn"
                style={{
                    width: '100%',
                    background: gradient,
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isConnected ? '0 0 20px rgba(13, 148, 136, 0.4)' : 'none',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {isConnected && (
                    <span style={{
                        width: '8px', height: '8px', background: '#fff',
                        borderRadius: '50%', display: 'inline-block', animation: 'senti-pulse 1.5s infinite'
                    }} />
                )}
                <span>{isConnected ? 'STOP SENTI AI' : label}</span>
                {!isConnected && <span>🎙️</span>}
                {isHovered && !isConnected && (
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px',
                        background: 'rgba(255,255,255,0.4)', animation: 'senti-loading 1.5s ease-in-out infinite'
                    }} />
                )}
            </button>

            {isConnected && (
                <div style={{
                    fontSize: '11px', color: 'var(--teal-600, #0d9488)', textAlign: 'center',
                    marginTop: '5px', fontWeight: '600', animation: 'senti-fadein 0.5s ease'
                }}>
                    ● Agent is listening...
                </div>
            )}

            <style>{`
                @keyframes senti-pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes senti-loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes senti-fadein {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
