import { useState } from "react";
import { loginApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/ui/Button";
import { getRoleFromToken } from "../utils/jwtUtils";
import { trackProductEvent } from "../utils/eventTracker";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
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
          { dedupeKey: `login-${form.username}` },
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
      title="Sign in to RankX"
      subtitle="Enter your credentials to access your workspace."
      topPrompt="Don't have an account?"
      topActionLabel="Sign up"
      topActionTo="/register"
      sideTag="Trusted by 50,000+ learners"
      sideTitle="Welcome back to your journey."
      sideDescription="Pick up right where you left off - problems to solve, quizzes to ace, and plans to complete."
      sideStats={[
        { value: "1,200+", label: "Problems" },
        { value: "300+", label: "Quizzes" },
        { value: "98%", label: "Accuracy" },
      ]}
      sideQuote={{
        initials: "PM",
        name: "Priya Mehta",
        role: "Software Engineer @ Google",
        quote: "RankX helped me land my dream job at Google. The structured study plans are unlike anything else out there.",
      }}
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
          autoComplete="username"
          icon="user"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          autoComplete="current-password"
          icon="lock"
        />

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-500/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-2xl bg-[#6f63ff] py-4 text-base font-semibold shadow-[0_20px_40px_rgba(111,99,255,0.28)] hover:bg-[#7b70ff]"
        >
          {loading ? "Logging in..." : "Sign in"}
        </Button>

        <div className="space-y-3 pt-2 text-center">
          <p className="text-xs leading-6 text-[#6f7a90]">
            By signing in you agree to our Terms and Privacy Policy.
          </p>
          <p className="text-xs leading-6 text-[#566276]">
            Your dashboard, progress history, and onboarding preferences stay synced across every session.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
