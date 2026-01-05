// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi, verifyOtpApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("FORM"); // FORM | OTP

  const [form, setForm] = useState({
    username: "",
    password: "",
    mobile: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // STEP 1: REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
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

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyOtpApi({
        mobile: form.mobile,
        otp,
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
      title={step === "FORM" ? "Create account 🚀" : "Verify OTP 🔐"}
      subtitle={
        step === "FORM"
          ? "Register to continue"
          : `OTP sent to ${form.mobile}`
      }
    >
      {/* REGISTER FORM */}
      {step === "FORM" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <AuthInput
            label="Username"
            type="text"
            placeholder="4–20 characters"
            value={form.username}   // ✅ FIX
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}   // ✅ FIX
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <AuthInput
            label="Mobile"
            type="text"
            placeholder="10-digit mobile number"
            value={form.mobile}     // ✅ FIX
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg
                       disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>
      )}

      {/* OTP FORM */}
      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a]
                       text-white border border-gray-700
                       focus:border-green-500 outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg
                       disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p
            className="text-sm text-gray-400 text-center cursor-pointer
                       hover:text-green-500"
            onClick={() => setStep("FORM")}
          >
            Edit mobile number
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
