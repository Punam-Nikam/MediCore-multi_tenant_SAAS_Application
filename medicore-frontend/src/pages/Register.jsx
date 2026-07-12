import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import '../styles/Auth.css';

export default function Register() {
    const [f, setF] = useState({ clinicName:'', ownerName:'', email:'', password:'', phone:'', city:'' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const set = k => e => setF({ ...f, [k]: e.target.value });

    async function go() {
        if (!f.clinicName || !f.ownerName || !f.email || !f.password) {
            setError('Clinic name, your name, email and password are required'); return;
        }
        if (f.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        const r = await register(f);
        setLoading(false);
        if (r.tenantId || r.message) nav('/login');
        else setError(r.error || 'Registration failed. Email may already be used.');
    }

    return (
        <div className="auth-wrap">
            <div className="auth-left">
                <img className="auth-left-img"
                     src="https://img.freepik.com/premium-photo/hand-doctor-analysis-record-data-information-patient-with-healthcare-medical-icon_1028938-124155.jpg"
                     alt="Hospital" />
                <h2>Register your clinic</h2>
                <p>Join MediCore and go fully digital in under 2 minutes. Feel free to start.</p>
            </div>

            <div className="auth-right">
                <div className="auth-box">
                    <div className="auth-logo">Medi<b>Core</b></div>
                    <div className="auth-title">Create account</div>
                    <div className="auth-sub">Set up your clinic on MediCore</div>

                    {error && <div className="auth-err">{error}</div>}

                    <div className="fld-row">
                        <div className="fld">
                            <label>Clinic name *</label>
                            <input placeholder="City Care Clinic" value={f.clinicName} onChange={set('clinicName')} />
                        </div>
                        <div className="fld">
                            <label>Your name *</label>
                            <input placeholder="Dr. Name" value={f.ownerName} onChange={set('ownerName')} />
                        </div>
                    </div>
                    <div className="fld">
                        <label>Email *</label>
                        <input type="email" placeholder="you@clinic.com" value={f.email} onChange={set('email')} />
                    </div>
                    <div className="fld">
                        <label>Password *</label>
                        <input type="password" placeholder="Min 6 characters" value={f.password} onChange={set('password')} />
                    </div>
                    <div className="fld-row">
                        <div className="fld">
                            <label>Phone</label>
                            <input placeholder="9876543210" value={f.phone} onChange={set('phone')} />
                        </div>
                        <div className="fld">
                            <label>City</label>
                            <input placeholder="Mumbai" value={f.city} onChange={set('city')} />
                        </div>
                    </div>

                    <button className="btn-auth" onClick={go} disabled={loading}>
                        {loading ? 'Creating...' : 'Create clinic account →'}
                    </button>

                    <div className="auth-switch">
                        Already registered? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}