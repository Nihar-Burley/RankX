import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import { getRoleFromToken } from "../utils/jwtUtils";
import { trackProductEvent } from "../utils/eventTracker";

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
      const token = res.data.accessToken;

      localStorage.setItem("token", token);

      const role = getRoleFromToken(token);
      if (!role) {
        throw new Error("Role not found in token");
      }

      localStorage.setItem("role", role);

      if (role === "ROLE_USER") {
        trackProductEvent(
          {
            eventName: "AUTH_LOGIN_SUCCESS",
            eventCategory: "AUTH",
            source: "WEB",
            track: "BOTH",
          },
          { dedupeKey: `login-${form.username}` }
        );
        navigate("/home");
      } else {
        throw new Error("Unauthorized: You are not a valid user");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your coding and quiz practice."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-teal-300 hover:text-teal-200">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
