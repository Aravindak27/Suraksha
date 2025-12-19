import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export const Login = () => {
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [isSignup, setIsSignup] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let success = false;
        if (isSignup) {
            success = await signup(name, email, phone, password);
        } else {
            success = await login(email, password);
        }

        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1>🔐 SURAKSHA</h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                    {isSignup ? 'Create your Protection Account' : 'Login to Dashboard'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {isSignup && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="auth-input"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="auth-input"
                        required
                    />

                    <button type="submit" className="action-btn start-btn">
                        {isSignup ? 'SIGN UP' : 'LOGIN'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                    >
                        {isSignup ? 'Login' : 'Sign Up'}
                    </button>
                </p>

                {/* Visual Style for Inputs */}
                <style>{`
                    .auth-input {
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #334155;
                        background: #0f172a;
                        color: white;
                        outline: none;
                    }
                    .auth-input:focus {
                        border-color: #10b981;
                    }
                `}</style>
            </div>
        </div>
    );
};
