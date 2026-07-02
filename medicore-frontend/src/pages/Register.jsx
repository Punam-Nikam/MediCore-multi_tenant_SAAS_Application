import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import '../styles/Auth.css';

function Register() {
    const [form, setForm] = useState({ clinicName:'', ownerName:'', email:'', password:'', phone:'', city:'' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    async function handleRegister() {
        if (!form.clinicName || !form.ownerName || !form.email || !form.password) {
            setError('Clinic name, your name, email and password are required'); return;
        }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        const result = await register(form);
        setLoading(false);
        if (result.message || result.tenantId) {
            navigate('/login');
        } else {
            setError(result.error || 'Registration failed');
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo"><span>M</span> MediCore</div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Set up your clinic on MediCore for free</p>

                {error && <div className="auth-error">{error}</div>}

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Clinic name *</label>
                        <input className="form-input" placeholder="e.g. City Care Clinic" value={form.clinicName} onChange={set('clinicName')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Your name *</label>
                        <input className="form-input" placeholder="Dr. Full Name" value={form.ownerName} onChange={set('ownerName')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email address *</label>
                        <input className="form-input" type="email" placeholder="you@clinic.com" value={form.email} onChange={set('email')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" placeholder="Mumbai" value={form.city} onChange={set('city')} />
                    </div>
                </div>

                <button className="btn-full" onClick={handleRegister} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create clinic account'}
                </button>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;