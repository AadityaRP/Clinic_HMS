import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animateText, setAnimateText] = useState(false);

    useEffect(() => {
        // Trigger text animation on mount
        setAnimateText(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Ensure absolutely no old expired tokens are sent with this login request!
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        try {
            const res = await api.post('/auth/login/', form);
            const { access, user } = res.data;
            localStorage.setItem('hms_token', access);
            localStorage.setItem('hms_user', JSON.stringify(user));
            
            // Use window.location.href instead of navigate() to perform a full reload
            // This ensures App.jsx immediately initializes with the correct user state
            // avoiding the 300ms interval lag that bumped users back to the login page.
            if (user.role === 'doctor') {
                window.location.href = '/doctor/dashboard';
            } else {
                window.location.href = '/frontdesk/dashboard';
            }
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }

                .login-hero-anim {
                    animation: fadeSlideUp 0.6s ease-in-out forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }

                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .btn-hover {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-hover:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    transform: translateY(-50%) scale(1.03);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
                }

                .modal-enter {
                    animation: scaleFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes scaleFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .hero-video {
                    object-fit: cover;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    z-index: 0;
                }

                .input-field {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.4);
                }
                .input-field:focus {
                    border-color: rgba(255,255,255,0.5);
                    background: rgba(255,255,255,0.12);
                    box-shadow: 0 0 0 4px rgba(255,255,255,0.05);
                }

                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    background: white;
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 12px;
                }
                .submit-btn:hover {
                    background: #f0f0f0;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(255,255,255,0.1);
                }
                .submit-btn:active {
                    transform: translateY(1px);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 768px) {
                    .hospital-title {
                        font-size: 3rem !important;
                    }
                    .hospital-subtitle {
                        font-size: 1.25rem !important;
                    }
                    .floating-login-btn {
                        position: absolute !important;
                        top: 24px !important;
                        right: 24px !important;
                        transform: none !important;
                        margin-top: 0 !important;
                        padding: 12px 24px !important;
                        font-size: 16px !important;
                        width: auto;
                        justify-content: center;
                    }
                    .hero-content {
                        flex-direction: column;
                        justify-content: flex-end;
                        align-items: flex-start;
                        height: 100vh;
                        padding: 32px !important;
                        text-align: left !important;
                    }
                    .btn-hover:hover {
                        transform: scale(1.02) !important;
                    }
                }
                `}
            </style>

            <video
                src="/hero_section_background.mp4"
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
            />

            <div className="hero-content" style={styles.heroContent}>
                <div style={styles.textContent}>
                    <h1 className={animateText ? "login-hero-anim hospital-title" : "hospital-title"} style={{...styles.title, animationDelay: '0.1s'}}>
                        Global Hospital
                    </h1>
                    <p className={animateText ? "login-hero-anim hospital-subtitle" : "hospital-subtitle"} style={{...styles.subtitle, animationDelay: '0.3s'}}>
                        Bettercare, Everywhere
                    </p>
                </div>

                {!isModalOpen && (
                    <button 
                        className="floating-login-btn btn-hover login-hero-anim" 
                        style={{...styles.floatingBtn, animationDelay: '0.5s'}}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Login →
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="modal-enter" 
                        style={styles.modalContainer}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.5px' }}>Welcome Back</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '15px' }}>Please enter your credentials to access your dashboard.</p>
                        
                        {error && <div style={styles.errorBanner}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={styles.label}>Email Address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button className="submit-btn" type="submit" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                        
                        <button 
                            style={styles.closeBtn} 
                            onClick={() => setIsModalOpen(false)}
                            onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
                            onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
    },
    heroContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '8% 8%',
        zIndex: 1,
    },
    textContent: {
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    title: {
        fontSize: '5rem',
        fontWeight: 700,
        margin: 0,
        lineHeight: 1.1,
        letterSpacing: '-1.5px',
        color: '#F0E491',
        textShadow: '0px 4px 12px rgba(0,0,0,0.5)',
    },
    subtitle: {
        fontSize: '1.75rem',
        fontWeight: 300,
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: '20px',
        letterSpacing: '-0.5px',
    },
    floatingBtn: {
        position: 'absolute',
        right: '60px',
        top: '60px',
        transform: 'none',
        padding: '16px 40px',
        fontSize: '18px',
        fontWeight: 700,
        color: '#F0E491',
        backgroundColor: 'rgba(140, 245, 231, 0.11)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50px',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    modalContainer: {
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(20, 20, 20, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#f87171',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        marginBottom: '24px',
        textAlign: 'center',
    },
    label: {
        display: 'block',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '8px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        fontWeight: 500,
        width: '100%',
        marginTop: '20px',
        cursor: 'pointer',
        transition: 'color 0.2s',
    }
};
