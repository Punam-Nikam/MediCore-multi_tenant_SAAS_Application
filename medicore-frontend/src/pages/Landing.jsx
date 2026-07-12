import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const features = [
    {
        img: 'https://www.esht.nhs.uk/wp-content/uploads/2017/04/6.-Main-Reception-Desk-1200x816.jpg',
        title: 'Smart Reception Management',
        desc: 'Manage patient check-ins, appointments and walk-ins from one clean dashboard.'
    },
    {
        img: 'https://www.proofpoint.com/sites/default/files/styles/metatag/public/blog-banners/pfpt-hc-blog-banner-2.jpg.webp?itok=4uozbZPA',
        title: 'Complete Patient Records',
        desc: 'Maintain full patient history — blood group, complaints, contact details and visit records.'
    },
    {
        img: 'https://his.aiimspatna.edu.in/HIS/hisglobal/assets/aiimslandingpageassets/assets/medical-billing.png',
        title: 'Billing & Online Payments',
        desc: 'Create invoices instantly and collect fees online. Track paid and pending bills effortlessly.'
    }
];

export default function Landing() {
    const nav = useNavigate();
    return (
        <div className="land">
            <nav className="land-nav">
                <div className="logo-container">
                    <img
                        className="svg"
                        src="https://img.freepik.com/premium-vector/hospital-logo-design-vector-illustration-white-background_272204-8968.jpg"
                        alt="MediCore Logo"
                    />
                <div className="land-logo">Medi<b>Core</b></div>
                </div>
                <div className="nav-btns">
                    <button className="btn-ghost" onClick={() => nav('/login')}>Login</button>
                    <button className="btn-solid" onClick={() => nav('/register')}>Get started free</button>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-text">
                    <h1>The <span>Digital Core</span> of Your Clinic</h1>
                    <p>MediCore helps clinics manage patients, invoices and payments — all in one secure, fast platform. No paperwork. No confusion. Just care.</p>
                    <div className="hero-btns">
                        <button className="btn-big" onClick={() => nav('/register')}>Start for free →</button>
                        <button className="btn-big-ghost" onClick={() => nav('/login')}>Sign in</button>
                    </div>
                </div>
                <img
                    className="hero-img"
                    src="https://arcmaxarchitect.com/sites/default/files/best_architect_for_multi_specialty_hospital_design.jpg"
                    alt="MediCore Hospital"
                />
            </section>

            <div className="stats-bar">
                <div className="stat-item"><div className="stat-num">∞</div><div className="stat-lbl">Clinics supported</div></div>
                <div className="stat-item"><div className="stat-num">100%</div><div className="stat-lbl">Data isolated per clinic</div></div>
                <div className="stat-item"><div className="stat-num">Free</div><div className="stat-lbl">To get started</div></div>
                <div className="stat-item"><div className="stat-num">Secure</div><div className="stat-lbl">JWT + BCrypt auth</div></div>
            </div>

            <section className="features">
                <div className="sec-head">
                    <h2>Everything your clinic needs</h2>
                    <p>Built specifically for healthcare — not a generic billing tool.</p>
                </div>
                <div className="feat-grid">
                    {features.map((f, i) => (
                        <div className="feat-card" key={i}>
                            <img className="feat-img" src={f.img} alt={f.title} />
                            <div className="feat-body">
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta">
                <h2>Ready to go digital?</h2>
                <p>Register your clinic in under 2 minutes. No credit card required.</p>
                <button className="btn-white" onClick={() => nav('/register')}>Create free account →</button>
            </section>

            <footer className="land-footer">
                © 2026 MediCore — Built with Java + React · All rights reserved
            </footer>
        </div>
    );
}