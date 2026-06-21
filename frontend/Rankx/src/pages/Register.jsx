import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi, verifyOtpApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import { trackProductEvent } from "../utils/eventTracker";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("FORM");
  const [form, setForm] = useState({
    username: "",
    password: "",
    mobile: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerApi(form);
      setStep("OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyOtpApi({
        mobile: form.mobile,
        otp,
      });

      trackProductEvent({
        eventName: "AUTH_REGISTER_COMPLETED",
        eventCategory: "AUTH",
        source: "WEB",
        track: "BOTH",
        metadata: {
          mobileCountry: "IN",
        },
      });
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === "FORM" ? "Create account" : "Verify OTP"}
      subtitle={step === "FORM" ? "Register to continue" : `OTP sent to ${form.mobile}`}
    >
      {step === "FORM" ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <AuthInput
            label="Username"
            type="text"
            placeholder="4-20 characters"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <AuthInput
            label="Mobile"
            type="text"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2.5 text-white disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-lg border border-gray-700 bg-[#1a1a1a] px-4 py-2 text-white outline-none focus:border-green-500"
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2.5 text-white disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            className="w-full text-center text-sm text-gray-400 hover:text-green-500"
            onClick={() => setStep("FORM")}
          >
            Edit mobile number
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
