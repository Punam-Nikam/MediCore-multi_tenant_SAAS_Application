import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const features = [
    { icon: '🏥', title: 'Multi-Tenant Architecture', desc: 'Each clinic gets their own completely isolated workspace. Your data is always private and secure.' },
    { icon: '👥', title: 'Patient Management', desc: 'Add, view, update and delete patient records. Full medical history with blood group and complaints.' },
    { icon: '🧾', title: 'Invoice & Billing', desc: 'Create invoices for any patient. Track pending and paid bills with real-time status updates.' },
    { icon: '💳', title: 'Online Payments', desc: 'Integrated payment gateway for collecting fees online. Automatic invoice status updates on payment.' },
    { icon: '🔐', title: 'Secure Authentication', desc: 'JWT-based login with BCrypt password hashing. Every request is verified and tenant-isolated.' },
    { icon: '📊', title: 'Revenue Dashboard', desc: 'See your total patients, invoices, revenue and pending amounts at a glance.' },
];

function Landing() {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <nav className="landing-nav">
                <div className="landing-logo">
                    <span>M</span> MediCore
                </div>
                <div className="landing-nav-links">
                    <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn-primary" onClick={() => navigate('/register')}>Get started free</button>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-badge">🏥 Multi-Tenant Healthcare SaaS Platform</div>
                <h1>The Core of Every<br /><span>Clinic's Operations</span></h1>
                <p>MediCore helps clinics manage patients, create invoices, and collect payments — all in one secure, fast, and beautiful platform built for modern healthcare.</p>
                <div className="hero-actions">
                    <button className="btn-hero" onClick={() => navigate('/register')}>Start for free →</button>
                    <button className="btn-hero-outline" onClick={() => navigate('/login')}>Sign in</button>
                </div>
                <div className="hero-stats">
                    <div className="hero-stat"><div className="hero-stat-val">100%</div><div className="hero-stat-label">Data isolated</div></div>
                    <div className="hero-stat"><div className="hero-stat-val">∞</div><div className="hero-stat-label">Clinics supported</div></div>
                    <div className="hero-stat"><div className="hero-stat-val">Free</div><div className="hero-stat-label">To get started</div></div>
                </div>
            </section>

            <section className="features">
                <div className="features-header">
                    <h2>Everything your clinic needs</h2>
                    <p>Built from the ground up for healthcare professionals who want simplicity without compromise.</p>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta-section">
                <h2>Ready to modernize your clinic?</h2>
                <p>Join hundreds of clinics already using MediCore to streamline their operations.</p>
                <button className="btn-white" onClick={() => navigate('/register')}>Create your free account →</button>
            </section>

            <footer className="landing-footer">
                © 2025 MediCore. Built with Java + React. All rights reserved.
            </footer>
        </div>
    );
}

export default Landing;