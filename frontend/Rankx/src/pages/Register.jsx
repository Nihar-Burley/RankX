import { useState } from "react";
import { registerApi, verifyOtpApi } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/ui/Button";
import { trackProductEvent } from "../utils/eventTracker";
import { useNavigate } from "react-router-dom";

function StepIndicator({ step }) {
  const items = [
    { key: "FORM", label: "Your details" },
    { key: "OTP", label: "Verify mobile" },
  ];

  return (
    <div className="flex items-center gap-3 text-xs font-medium text-[#6f7a90]">
      {items.map((item, index) => {
        const isActive = item.key === step;
        const isComplete = step === "OTP" && item.key === "FORM";

        return (
          <div key={item.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors",
                  isActive
                    ? "border-[#7c69ff] bg-[#7c69ff] text-white"
                    : isComplete
                      ? "border-[#7c69ff]/50 bg-[#7c69ff]/18 text-[#a89fff]"
                      : "border-white/12 bg-white/[0.03] text-[#7c88a2]",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <span className={isActive ? "text-white" : isComplete ? "text-[#c7d0e1]" : ""}>{item.label}</span>
            </div>
            {index < items.length - 1 ? <span className="h-px w-8 bg-white/10" /> : null}
          </div>
        );
      })}
    </div>
  );
}

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
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const isFormStep = step === "FORM";

  return (
    <AuthLayout
      title={isFormStep ? "Create your account" : "Verify your mobile"}
      subtitle={
        isFormStep
          ? "Create your RankX account and start with guided practice, quizzes, and progress tracking from day one."
          : `Enter the one-time password sent to ${form.mobile} to finish setting up your account.`
      }
      topPrompt="Already have an account?"
      topActionLabel="Sign in"
      topActionTo="/login"
      sideTag={isFormStep ? "Trusted by 50,000+ learners" : "One step left"}
      sideTitle={isFormStep ? "Start your journey to the top." : "Verify and unlock your workspace."}
      sideDescription={
        isFormStep
          ? "Join 50,000+ learners using RankX to crack interviews, ace exams, and level up their skills."
          : "Confirm your mobile number to activate your account and keep your progress synced securely from the first session."
      }
      sideBullets={
        isFormStep
          ? [
              "Access to 1,200+ coding problems",
              "300+ quiz assessments with detailed feedback",
              "Personalized AI-powered study plans",
              "Real compiler with instant verdicts",
              "Track progress with advanced analytics",
            ]
          : [
              "Secure account setup with OTP verification",
              "Progress, submissions, and onboarding saved from day one",
              "Fast access to coding, quizzes, and study plans after verification",
            ]
      }
      sideFooter={
        isFormStep
          ? {
              avatars: ["AJ", "PM", "MJ", "AT", "LK"],
              title: "50,000+ learners",
              caption: "and growing every day",
            }
          : {
              avatars: ["RX", "AI", "QA"],
              title: "Secure onboarding",
              caption: "built to keep your account ready and protected",
            }
      }
      stepIndicator={<StepIndicator step={step} />}
    >
      {isFormStep ? (
        <form onSubmit={handleRegister} className="space-y-5">
          <AuthInput
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            autoComplete="username"
            icon="user"
          />

          <AuthInput
            label="Mobile number"
            type="text"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={(event) => setForm({ ...form, mobile: event.target.value })}
            inputMode="tel"
            autoComplete="tel"
            icon="phone"
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            autoComplete="new-password"
            icon="lock"
          />

          {error ? (
            <div className="rounded-2xl border border-rose-500/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-[#6f63ff] py-4 text-base font-semibold shadow-[0_20px_40px_rgba(111,99,255,0.28)] hover:bg-[#7b70ff]"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </Button>

          <p className="pt-2 text-center text-xs leading-6 text-[#6f7a90]">
            By signing up you agree to our Terms and Privacy Policy.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <AuthInput
            label="One-time password"
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            icon="shield"
          />

          {error ? (
            <div className="rounded-2xl border border-rose-500/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-[#6f63ff] py-4 text-base font-semibold shadow-[0_20px_40px_rgba(111,99,255,0.28)] hover:bg-[#7b70ff]"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center rounded-2xl border border-white/10 py-4 text-sm font-medium text-[#8a95aa] hover:border-white/16 hover:bg-white/[0.03] hover:text-white"
            onClick={() => setStep("FORM")}
          >
            Edit mobile number
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
