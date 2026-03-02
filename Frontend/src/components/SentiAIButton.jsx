import { useConversation } from '@elevenlabs/react';
import { useState, useCallback } from 'react';

export default function SentiAIButton({ agentId = 'agent_0901kjpsdxxjf729dded03p3c9ht', label = 'SENTI AI', style = {} }) {
    const [isHovered, setIsHovered] = useState(false);

    const conversation = useConversation({
        onConnect: () => console.log('Senti AI Connected'),
        onDisconnect: () => console.log('Senti AI Disconnected'),
        onError: (err) => console.error('Senti AI Error:', err),
    });

    const isConnected = conversation.status === 'connected';

    const handleMouseEnter = useCallback(async () => {
        setIsHovered(true);
        if (conversation.status === 'connected' || conversation.status === 'connecting') return;

        try {
            // Request microphone access first
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await conversation.startSession({ agentId });
        } catch (error) {
            console.error('Failed to start Senti AI session:', error);
        }
    }, [conversation, agentId]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        // We don't necessarily stop on mouse leave to allow user to continue speaking
        // unless they click a "Stop" button or we implement an auto-stop logic.
        // For now, let's keep it running so they can finish their sentence.
    }, []);

    const stopSession = async () => {
        await conversation.endSession();
    };

    const gradient = isConnected
        ? 'linear-gradient(135deg, #ef4444, #b91c1c)' // Red if active (to stop)
        : 'linear-gradient(135deg, #0d9488, #0f766e)'; // Teal/Senti color

    return (
        <div
            style={{
                marginTop: 10,
                position: 'relative',
                ...style
            }}
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
                    overflow: 'hidden'
                }}
            >
                {isConnected && (
                    <span className="pulse-dot" style={{
                        width: '8px',
                        height: '8px',
                        background: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 1.5s infinite'
                    }}></span>
                )}
                <span>{isConnected ? 'STOP SENTI AI' : label}</span>
                {!isConnected && <span>🎙️</span>}

                {/* Visual indicator for "hovering" status */}
                {isHovered && !isConnected && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: 'rgba(255,255,255,0.4)',
                        animation: 'loading-bar 1.5s ease-in-out infinite'
                    }} />
                )}
            </button>

            {isConnected && (
                <div style={{
                    fontSize: '11px',
                    color: 'var(--teal-600)',
                    textAlign: 'center',
                    marginTop: '5px',
                    fontWeight: '600',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    ● Agent is listening...
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
