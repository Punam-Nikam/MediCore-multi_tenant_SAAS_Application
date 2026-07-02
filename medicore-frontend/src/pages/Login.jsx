import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import '../styles/Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin() {
        if (!email || !password) { setError('Email and password are required'); return; }
        setLoading(true); setError('');
        const result = await login(email, password);
        setLoading(false);
        if (result.token) {
            localStorage.setItem('token', result.token);
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid email or password');
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleLogin();
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo"><span>M</span> MediCore</div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your clinic account</p>

                {error && <div className="auth-error">{error}</div>}

                <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input className="form-input" type="email" placeholder="clinic@example.com"
                           value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="••••••••"
                           value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
                </div>

                <button className="btn-full" onClick={handleLogin} disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Create one free</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;