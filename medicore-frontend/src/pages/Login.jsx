import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import '../styles/Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function go() {
        if (!email || !password) { setError('Enter email and password'); return; }
        setLoading(true); setError('');
        const r = await login(email, password);
        setLoading(false);
        if (r.token) { localStorage.setItem('token', r.token); nav('/dashboard'); }
        else setError(r.error || 'Invalid credentials');
    }

    return (
        <div className="auth-wrap">
            <div className="auth-left">
                <img className="auth-left-img"
                     src="https://media.istockphoto.com/id/1809149078/photo/doctor-in-a-white-coat-logs-into-the-system-using-a-laptop.jpg?s=612x612&w=0&k=20&c=iH1ADm_WE6pmuyVBsm1oeX3y4PvVNH6IL4L_wH3u8Sw="
                     alt="Reception" />
                <h2>Welcome to MediCore</h2>
                <p>Your clinic's complete digital operations platform. Patients, billing and payments — all in one place.</p>
            </div>

            <div className="auth-right">
                <div className="auth-box">
                    <div className="auth-logo">Medi<b>Core</b></div>
                    <div className="auth-title">Sign in</div>
                    <div className="auth-sub">Enter your clinic credentials</div>

                    {error && <div className="auth-err">{error}</div>}

                    <div className="fld">
                        <label>Email</label>
                        <input type="email" placeholder="clinic@example.com"
                               value={email} onChange={e => setEmail(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && go()} />
                    </div>
                    <div className="fld">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••"
                               value={password} onChange={e => setPassword(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && go()} />
                    </div>

                    <button className="btn-auth" onClick={go} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in →'}
                    </button>

                    <div className="auth-switch">
                        No account? <Link to="/register">Create one free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}