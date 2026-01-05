// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { loginApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await loginApi(form);
            console.log("Login response:", res.data);

            localStorage.setItem("token", res.data.accessToken);

            // 🔥 redirect to problem list
            navigate("/problems");

        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back 👋"
            subtitle="Login to continue your journey"
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <AuthInput
                    label="Username"
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}   // ✅ FIX
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <AuthInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}   // ✅ FIX
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700
                     text-white rounded-lg font-semibold transition
                     disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-sm text-gray-400 text-center mt-4">
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-green-500 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
