import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <nav className="flex justify-between items-center px-8 py-4 shadow-sm bg-white">
                <h1 className="text-2xl font-bold text-blue-600">MediCore</h1>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/login')}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                        Login
                    </button>
                    <button onClick={() => navigate('/register')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Get Started
                    </button>
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center text-center py-24 px-4">
        <span className="bg-blue-100 text-blue-600 text-sm px-4 py-1 rounded-full mb-4">
          Multi-Tenant Healthcare SaaS
        </span>
                <h2 className="text-5xl font-bold text-gray-800 mb-4">
                    The Core of Every<br />
                    <span className="text-blue-600">Clinic's Operations</span>
                </h2>
                <p className="text-gray-500 text-lg max-w-xl mb-8">
                    MediCore helps clinics manage patients, invoices, and payments — all in one secure platform. Built for modern healthcare practices.
                </p>
                <button onClick={() => navigate('/register')}
                        className="px-8 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 shadow-lg">
                    Start Free Today →
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-16 pb-20">
                {[
                    { title: "Patient Management", desc: "Add, view, update and delete patient records securely." },
                    { title: "Invoice & Billing", desc: "Create invoices and collect payments online instantly." },
                    { title: "Multi-Tenant Security", desc: "Your clinic's data is completely isolated from others." }
                ].map((f, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                        <p className="text-gray-500 text-sm">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Landing;