import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

function Register() {
    const [form, setForm] = useState({ clinicName: "", ownerName: "", email: "", password: "", phone: "", city: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleRegister() {
        if (!form.clinicName || !form.email || !form.password) {
            setError("Clinic name, email and password are required"); return;
        }
        setLoading(true);
        setError("");
        const result = await register(form);
        setLoading(false);
        if (result.message) {
            navigate('/login');
        } else {
            setError(result.error || "Registration failed");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-600 mb-1">MediCore</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Create your clinic account</h2>

                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

                <div className="flex flex-col gap-3">
                    {[
                        { name: "clinicName", placeholder: "Clinic Name", type: "text" },
                        { name: "ownerName", placeholder: "Your Full Name", type: "text" },
                        { name: "email", placeholder: "Email Address", type: "email" },
                        { name: "password", placeholder: "Password (min 6 chars)", type: "password" },
                        { name: "phone", placeholder: "Phone Number", type: "text" },
                        { name: "city", placeholder: "City", type: "text" },
                    ].map((field) => (
                        <input key={field.name} type={field.type} name={field.name}
                               placeholder={field.placeholder} value={form[field.name]}
                               onChange={handleChange}
                               className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400" />
                    ))}
                    <button onClick={handleRegister} disabled={loading}
                            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600 font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;