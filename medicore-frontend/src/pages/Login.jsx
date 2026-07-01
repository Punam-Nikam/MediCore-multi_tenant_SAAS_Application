import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin() {
        if (!email || !password) { setError("All fields required"); return; }
        setLoading(true);
        setError("");
        const result = await login(email, password);
        setLoading(false);
        if (result.token) {
            localStorage.setItem("token", result.token);
            navigate('/dashboard');
        } else {
            setError(result.error || "Login failed");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-600 mb-1">MediCore</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome back</h2>

                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

                <div className="flex flex-col gap-4">
                    <input type="email" placeholder="Email address"
                           value={email} onChange={(e) => setEmail(e.target.value)}
                           className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400" />
                    <input type="password" placeholder="Password"
                           value={password} onChange={(e) => setPassword(e.target.value)}
                           className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400" />
                    <button onClick={handleLogin} disabled={loading}
                            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-medium">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;