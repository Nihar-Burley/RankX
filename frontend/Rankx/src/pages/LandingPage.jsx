import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const THEME_STORAGE_KEY = "rankx-landing-theme";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const socialProof = ["AJ", "PM", "MJ", "AT", "LK"];

const heroHighlights = [
  { label: "Code practice", value: "1,200+" },
  { label: "Quiz coverage", value: "300+" },
  { label: "Rank momentum", value: "98%" },
];

const metrics = [
  { value: "50,000+", label: "Active Learners" },
  { value: "1,200+", label: "Coding Problems" },
  { value: "300+", label: "Quiz Assessments" },
  { value: "98%", label: "Accuracy Rate" },
];

const features = [
  {
    icon: "code",
    badge: "Core",
    title: "Code Practice & Judge",
    description:
      "Write, run, and evaluate code in a real judge-backed environment. Get instant verdicts, runtime stats, and test case feedback.",
  },
  {
    icon: "quiz",
    badge: "Core",
    title: "Quiz Assessment Engine",
    description:
      "Timed quizzes with multi-format questions, flagging, live progress tracking, and topic-level score breakdowns.",
  },
  {
    icon: "book",
    badge: "Learning",
    title: "Guided Study Plans",
    description:
      "Structured learning paths with milestones, module tracking, streak rewards, and adaptive next-step suggestions.",
  },
  {
    icon: "brain",
    badge: "AI",
    title: "Personalized Recommendations",
    description:
      "AI-powered signals based on your gaps, quiz performance, and submission history. Always know what to practice next.",
  },
  {
    icon: "chart",
    badge: "Analytics",
    title: "Progress Analytics",
    description:
      "Track coding velocity, quiz accuracy, plan adherence, and momentum across all tracks in one dashboard.",
  },
  {
    icon: "shield",
    badge: "Admin",
    title: "Admin Control Center",
    description:
      "Full content management: publish questions, build quizzes, manage study plans, and monitor platform performance.",
  },
];

const steps = [
  {
    number: "01",
    icon: "branch",
    title: "Choose your track",
    description:
      "Pick coding practice, quiz assessment, or a curated study plan. Or all three - your progress syncs across tracks.",
  },
  {
    number: "02",
    icon: "brain",
    title: "Practice & get evaluated",
    description:
      "Submit code to a real judge backend or answer quiz questions. Get instant verdicts, detailed feedback, and scoring.",
  },
  {
    number: "03",
    icon: "trend",
    title: "Track, improve & rank up",
    description:
      "Analytics track your growth across all tracks. AI surfaces the exact skills you need to work on to move faster.",
  },
];

const testimonials = [
  {
    initials: "PM",
    name: "Priya Mehta",
    role: "Software Engineer @ Google",
    quote:
      "RankX helped me land my dream job. The study plans are incredibly structured - I went from struggling with DP to confidently solving hard problems in 8 weeks.",
  },
  {
    initials: "MJ",
    name: "Marcus Johnson",
    role: "Frontend Developer @ Stripe",
    quote:
      "The quiz engine is phenomenal. I used it for interview prep - the timed mode with flagging made a huge difference in my performance under pressure.",
  },
  {
    initials: "AT",
    name: "Aisha Torres",
    role: "CS Student @ MIT",
    quote:
      "I love how everything is connected - my quiz results actually influence the coding problems I get recommended. It feels like having a personal tutor.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect to get started and explore the platform.",
    price: "$0",
    suffix: "/forever",
    cta: "Get Started Free",
    featured: false,
    features: ["50 coding problems", "5 quizzes/month", "Basic analytics", "Community support"],
  },
  {
    name: "Pro",
    description: "For serious learners preparing for interviews or exams.",
    price: "$19",
    suffix: "/per month",
    cta: "Start Pro - Free Trial",
    featured: true,
    features: [
      "Unlimited problems",
      "Unlimited quizzes",
      "All study plans",
      "AI recommendations",
      "Priority support",
      "Progress reports",
    ],
  },
  {
    name: "Team",
    description: "For bootcamps, courses, and corporate training programs.",
    price: "$49",
    suffix: "/per month",
    cta: "Talk to Sales",
    featured: false,
    features: [
      "Everything in Pro",
      "Admin dashboard",
      "Custom study plans",
      "Cohort analytics",
      "SSO & API access",
      "Dedicated support",
    ],
  },
];

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Study Plans", "Pricing", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    title: "Support",
    links: ["Documentation", "Community", "Contact", "Status"],
  },
];

const themes = {
  dark: {
    page:
      "bg-[radial-gradient(circle_at_50%_0%,rgba(111,99,255,0.15),transparent_22%),radial-gradient(circle_at_15%_18%,rgba(65,101,255,0.1),transparent_20%),linear-gradient(180deg,#0a0c14_0%,#0a0d15_40%,#090b12_100%)] text-white",
    overlay:
      "bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(94,234,212,0.04),transparent_28%)]",
    nav: "border-white/8 bg-[#0c1019]/78 shadow-[0_18px_50px_rgba(0,0,0,0.18)]",
    divider: "border-white/8",
    navLink: "text-[#9ba6ba] hover:text-white",
    textPrimary: "text-white",
    textMuted: "text-[#9ca7bc]",
    textSubtle: "text-[#7d889d]",
    eyebrow: "text-[#8d86ff]",
    heroTag: "border-white/10 bg-white/[0.035] text-[#a8b2c7]",
    titleAccent: "text-[#7267ff]",
    titleUnderline: "bg-[#2a2550]",
    iconShell: "bg-[#241f42] text-[#8c82ff]",
    headerButton:
      "border-white/12 bg-transparent text-white hover:bg-white/[0.05] hover:border-white/20",
    primaryButton:
      "bg-[#6f63ff] text-white shadow-[0_22px_46px_rgba(111,99,255,0.34)] hover:bg-[#7d73ff]",
    primaryButtonSoft:
      "bg-white text-[#574ce7] shadow-[0_18px_38px_rgba(255,255,255,0.14)] hover:bg-white/92",
    previewShell:
      "border-white/10 bg-[linear-gradient(180deg,rgba(23,28,39,0.98),rgba(16,20,31,0.96))] shadow-[0_40px_120px_rgba(0,0,0,0.42)]",
    previewInset: "border-white/8 bg-[#171c27]",
    previewSoft: "border-white/8 bg-[#0c1020]",
    previewBar: "border-white/8 bg-[#1a1f2b]",
    previewPill: "bg-[#1c2232] text-[#7b8aa8]",
    quizOption: "border-white/8 bg-transparent text-[#a8b3c8]",
    quizOptionActive: "border-[#6f63ff] bg-[#241f42] text-[#958cff]",
    success: "bg-[#0e5f4d] text-[#8ff3cf]",
    statPanel: "border-white/8 bg-[#131823]",
    strip: "border-y border-white/8 bg-[#121722]/85",
    card:
      "border-white/8 bg-[linear-gradient(180deg,rgba(23,28,39,0.96),rgba(18,23,33,0.96))] shadow-[0_22px_60px_rgba(0,0,0,0.2)]",
    cardMuted: "border-white/8 bg-[#171c27]",
    badge: "border-white/8 bg-white/[0.03] text-[#9ba7bc]",
    stepNumber: "text-[#29265c]",
    pricingFeatured:
      "border-[#7b6fff] bg-[linear-gradient(180deg,#7867ff_0%,#6859f4_100%)] text-white shadow-[0_34px_84px_rgba(102,93,255,0.32)]",
    footer: "border-t border-white/8 bg-[#0d1119]",
    footerText: "text-[#778198]",
  },
  light: {
    page:
      "bg-[radial-gradient(circle_at_50%_0%,rgba(111,99,255,0.12),transparent_20%),radial-gradient(circle_at_100%_0%,rgba(14,165,233,0.07),transparent_24%),linear-gradient(180deg,#fcfdff_0%,#f7f9ff_36%,#f1f5ff_100%)] text-[#111827]",
    overlay:
      "bg-[radial-gradient(circle_at_12%_22%,rgba(99,102,241,0.08),transparent_24%),radial-gradient(circle_at_85%_8%,rgba(56,189,248,0.06),transparent_22%)]",
    nav: "border-slate-200/85 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
    divider: "border-slate-200/90",
    navLink: "text-[#58647d] hover:text-[#111827]",
    textPrimary: "text-[#111827]",
    textMuted: "text-[#5d6881]",
    textSubtle: "text-[#71819f]",
    eyebrow: "text-[#6658ff]",
    heroTag:
      "border-slate-200 bg-white/86 text-[#60708b] shadow-[0_14px_34px_rgba(15,23,42,0.05)]",
    titleAccent: "text-[#5d50ea]",
    titleUnderline: "bg-[#ddd8ff]",
    iconShell: "bg-[#f1efff] text-[#6658ff]",
    headerButton:
      "border-slate-200 bg-white/86 text-[#111827] hover:bg-white hover:border-slate-300 shadow-[0_10px_26px_rgba(15,23,42,0.04)]",
    primaryButton:
      "bg-[#6f63ff] text-white shadow-[0_22px_46px_rgba(111,99,255,0.22)] hover:bg-[#6658ff]",
    primaryButtonSoft:
      "bg-white text-[#5d50ea] shadow-[0_18px_38px_rgba(15,23,42,0.08)] hover:bg-[#f8f8ff]",
    previewShell:
      "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,251,255,0.98))] shadow-[0_38px_110px_rgba(15,23,42,0.14)]",
    previewInset: "border-slate-200/90 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.04)]",
    previewSoft: "border-slate-200/90 bg-[#f8faff]",
    previewBar: "border-slate-200/90 bg-[#f7f9fd]",
    previewPill: "bg-white text-[#64748b] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
    quizOption: "border-slate-200 bg-white text-[#5f6d86]",
    quizOptionActive: "border-[#6f63ff] bg-[#f4f2ff] text-[#5d50ea]",
    success: "bg-[#dcfce7] text-[#166534]",
    statPanel: "border-slate-200/90 bg-white/92 shadow-[0_16px_40px_rgba(15,23,42,0.05)]",
    strip: "border-y border-slate-200/90 bg-white/72 backdrop-blur-sm",
    card:
      "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,252,255,0.98))] shadow-[0_22px_52px_rgba(15,23,42,0.08)]",
    cardMuted: "border-slate-200/90 bg-white/92 shadow-[0_18px_44px_rgba(15,23,42,0.06)]",
    badge: "border-slate-200/90 bg-slate-50 text-[#6b7285]",
    stepNumber: "text-[#d6ddee]",
    pricingFeatured:
      "border-[#7b6fff] bg-[linear-gradient(180deg,#7867ff_0%,#6859f4_100%)] text-white shadow-[0_34px_84px_rgba(102,93,255,0.26)]",
    footer: "border-t border-slate-200/90 bg-white/82 backdrop-blur-sm",
    footerText: "text-[#71809c]",
  },
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  const prefersLight =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  return prefersLight ? "light" : "dark";
}

function Icon({ name, className = "h-4 w-4" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12H2.75M18.55 5.45l-1.8 1.8M7.25 16.75l-1.8 1.8M18.55 18.55l-1.8-1.8M7.25 7.25l-1.8-1.8" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20.2 14.5A7.8 7.8 0 0 1 9.5 3.8a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
          <path d="m18.5 13 0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8 0.8-2.2Z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5Z" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
          <path d="m13 6-2 12" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2.5" />
          <path d="M8.5 10.25h3M8.5 13.25h5.5M8.5 16.25h3.5" />
          <path d="M15.5 10.4a1.7 1.7 0 1 1 2.4 1.55c-0.75 0.34-1.15 0.7-1.15 1.55" />
          <path d="M16.75 16.4h0.01" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h11v15H7a2.5 2.5 0 0 0-2.5 2.5V6.5Z" />
          <path d="M7 4a2.5 2.5 0 0 0-2.5 2.5V20" />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <path d="M9 6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V7a2.5 2.5 0 0 1 2.5 2.5v.5A2.5 2.5 0 0 1 20 12.5v1A2.5 2.5 0 0 1 17.5 16v.5A2.5 2.5 0 0 1 15 19h-1a2.5 2.5 0 0 1-2.5-2.5V16A2.5 2.5 0 0 1 9 13.5v-1A2.5 2.5 0 0 1 6.5 10V9.5A2.5 2.5 0 0 1 9 7Z" />
          <path d="M12 8.5v7M9 10.5h3M12 13.5h3" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.8 6 6.2v5.2c0 3.95 2.45 7.6 6 8.8 3.55-1.2 6-4.85 6-8.8V6.2L12 3.8Z" />
          <path d="m9.25 12.4 1.75 1.8 3.75-4.1" />
        </svg>
      );
    case "branch":
      return (
        <svg {...common}>
          <path d="M6 5.5a2 2 0 1 0 0.01 0ZM18 18.5a2 2 0 1 0 0.01 0ZM18 5.5a2 2 0 1 0 0.01 0Z" />
          <path d="M8 5.5h4a2 2 0 0 1 2 2v7" />
          <path d="M14 14.5h2" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="m4 16 5-5 4 4 7-7" />
          <path d="M15 8h5v5" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3.5 2.6 5.3 5.9 0.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-0.9L12 3.5Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m6.5 12.2 3.4 3.4 7.6-8" />
        </svg>
      );
    case "dot-circle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" />
          <circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

function SectionIntro({ theme, eyebrow, title, description, align = "center" }) {
  const alignmentClass = align === "left" ? "text-left" : "text-center";
  const maxWidthClass = align === "left" ? "max-w-[660px]" : "mx-auto max-w-[760px]";

  return (
    <div className={alignmentClass}>
      <p className={cx("font-mono text-xs uppercase tracking-[0.36em]", theme.eyebrow)}>{eyebrow}</p>
      <h2 className="mt-5 text-[2.6rem] font-semibold tracking-[-0.045em] sm:text-[3.45rem] lg:text-[4rem]">
        {title}
      </h2>
      {description ? (
        <p className={cx("mt-5 text-lg leading-8 sm:text-xl", maxWidthClass, theme.textMuted)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function getPricingButtonClass(theme, featured) {
  return featured ? theme.primaryButtonSoft : theme.primaryButton;
}

function LandingPage() {
  const [themeMode, setThemeMode] = useState(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);

    const previousColorScheme = document.documentElement.style.colorScheme;
    const previousBackground = document.body.style.background;
    const previousColor = document.body.style.color;

    document.documentElement.style.colorScheme = themeMode;
    document.body.style.background = themeMode === "dark" ? "#0a0c14" : "#fcfdff";
    document.body.style.color = themeMode === "dark" ? "#ffffff" : "#111827";

    return () => {
      document.documentElement.style.colorScheme = previousColorScheme;
      document.body.style.background = previousBackground;
      document.body.style.color = previousColor;
    };
  }, [themeMode]);

  const theme = themes[themeMode];
  const containerClass = "mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10";

  return (
    <div data-theme={themeMode} className={cx("relative min-h-screen overflow-x-hidden transition-colors duration-300", theme.page)}>
      <div className={cx("pointer-events-none absolute inset-0", theme.overlay)} />

      <header className={cx("sticky top-0 z-50 border-b backdrop-blur-xl transition-colors", theme.nav)}>
        <div className={cx(containerClass, "flex min-h-[78px] items-center justify-between gap-4")}>
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className={cx("flex h-11 w-11 items-center justify-center rounded-2xl transition-colors", theme.primaryButton)}>
              <Icon name="book" className="h-4 w-4" />
            </span>
            <span className="text-[1.55rem] leading-none">RankX</span>
          </Link>

          <nav className="hidden items-center gap-10 text-[0.95rem] font-medium lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={cx("transition-colors", theme.navLink)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
              aria-pressed={themeMode === "light"}
              onClick={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
              className={cx("inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors", theme.headerButton)}
            >
              <Icon name={themeMode === "dark" ? "sun" : "moon"} className="h-4 w-4" />
            </button>
            <Link to="/login" className={cx("hidden text-sm font-medium transition-colors sm:inline-flex", theme.navLink)}>
              Sign in
            </Link>
            <Link
              to="/register"
              className={cx("inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors", theme.primaryButton)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-12 sm:pt-16 lg:pt-20 xl:pt-24">
          <div className={cx(containerClass, "text-center")}>
            <div className={cx("mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", theme.heroTag)}>
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              Dual-track learning - Code + Quiz, unified.
            </div>

            <h1 className="mx-auto mt-8 max-w-[1160px] text-[3.55rem] font-semibold leading-[0.92] tracking-[-0.065em] sm:text-[5rem] lg:text-[6.4rem] xl:text-[7rem]">
              <span className="block">Learn to code.</span>
              <span className={cx("relative mt-2 inline-block", theme.titleAccent)}>
                Get assessed.
                <span className={cx("absolute bottom-3 left-0 -z-10 h-3.5 w-full rounded-full opacity-90", theme.titleUnderline)} />
              </span>{" "}
              <span className="inline-block">Rank up.</span>
            </h1>

            <p className={cx("mx-auto mt-8 max-w-[920px] text-[1.15rem] leading-9 sm:text-[1.45rem] sm:leading-10 lg:text-[1.65rem]", theme.textMuted)}>
              RankX is the premium platform for coding practice, quiz assessment, and guided study - built for learners who are serious about getting better, faster.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className={cx("inline-flex min-w-[230px] items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-colors", theme.primaryButton)}
              >
                Start Learning Free
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
              <a
                href="#product-preview"
                className={cx("inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-semibold transition-colors", theme.headerButton)}
              >
                <Icon name="play" className="h-4 w-4" />
                Watch demo
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {heroHighlights.map((highlight) => (
                <div key={highlight.label} className="text-left">
                  <p className="text-lg font-semibold tracking-tight sm:text-xl">{highlight.value}</p>
                  <p className={cx("text-sm sm:text-[0.95rem]", theme.textSubtle)}>{highlight.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center">
                {socialProof.map((person, index) => (
                  <span
                    key={person}
                    className={cx("relative -ml-2.5 flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold first:ml-0", theme.cardMuted)}
                    style={{ zIndex: socialProof.length - index }}
                  >
                    {person}
                  </span>
                ))}
              </div>
              <p className={cx("text-base", theme.textMuted)}>
                <span className={theme.textPrimary}>50,000+</span> learners already ranking up
              </p>
            </div>
          </div>
        </section>

        <section id="product-preview" className="pt-12 sm:pt-16 lg:pt-20">
          <div className={containerClass}>
            <div className={cx("overflow-hidden rounded-[34px] border transition-colors", theme.previewShell)}>
              <div className={cx("flex items-center justify-between gap-4 border-b px-5 py-5 sm:px-7", theme.previewBar)}>
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#ff6c8d]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#f5c84b]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#3ed39a]" />
                </div>
                <div className={cx("rounded-full px-5 py-2 font-mono text-xs sm:min-w-[360px]", theme.previewPill)}>
                  app.rankx.io / dashboard
                </div>
                <div className="hidden lg:block lg:w-[76px]" />
              </div>

              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-4">
                {[
                  { icon: "trend", value: "74%", label: "Practice Progress" },
                  { icon: "quiz", value: "85%", label: "Quiz Score" },
                  { icon: "sparkles", value: "14", label: "Day Streak" },
                  { icon: "book", value: "#247", label: "Rank" },
                ].map((item) => (
                  <div key={item.label} className={cx("rounded-[24px] border p-6 transition-colors", theme.statPanel)}>
                    <span className={cx("inline-flex h-10 w-10 items-center justify-center rounded-2xl", theme.iconShell)}>
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <p className="mt-6 text-[2rem] font-semibold tracking-tight sm:text-[2.2rem]">{item.value}</p>
                    <p className={cx("mt-2 text-sm sm:text-[0.95rem]", theme.textMuted)}>{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 px-5 pb-5 sm:px-7 sm:pb-7 xl:grid-cols-[1.48fr_0.92fr]">
                <div className={cx("rounded-[26px] border p-6 transition-colors", theme.previewSoft)}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cx("inline-flex h-9 w-9 items-center justify-center rounded-2xl", theme.iconShell)}>
                        <Icon name="code" className="h-4 w-4" />
                      </span>
                      <span className={theme.textMuted}>Two Sum - Python 3</span>
                    </div>
                    <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", theme.success)}>Accepted</span>
                  </div>
                  <pre className="mt-6 overflow-x-auto font-mono text-sm leading-8 text-[#dce7ff] dark:text-[#dce7ff]">
                    <code>{`def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`}</code>
                  </pre>
                </div>

                <div className={cx("rounded-[26px] border p-6 transition-colors", theme.previewInset)}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={cx("inline-flex h-9 w-9 items-center justify-center rounded-2xl", theme.iconShell)}>
                      <Icon name="quiz" className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">DSA Quiz - Q3/12</span>
                  </div>
                  <h3 className="mt-6 text-[1.55rem] font-semibold tracking-[-0.03em]">
                    Which traversal uses a queue?
                  </h3>
                  <div className="mt-6 grid gap-3.5">
                    {[
                      { label: "A", text: "DFS" },
                      { label: "B", text: "BFS", active: true },
                      { label: "C", text: "Dijkstra" },
                      { label: "D", text: "Bellman-Ford" },
                    ].map((option) => (
                      <div
                        key={option.label}
                        className={cx(
                          "flex items-center justify-between rounded-2xl border px-4 py-4 text-sm transition-colors",
                          option.active ? theme.quizOptionActive : theme.quizOption,
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{option.label}</span>
                          <span>{option.text}</span>
                        </div>
                        {option.active ? <Icon name="dot-circle" className="h-4 w-4" /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cx("mt-16 sm:mt-20 lg:mt-24", theme.strip)}>
          <div className={cx(containerClass, "grid gap-10 py-10 text-center sm:grid-cols-2 xl:grid-cols-4")}>
            {metrics.map((metric) => (
              <div key={metric.label}>
                <p className="text-[2.85rem] font-semibold tracking-[-0.05em]">{metric.value}</p>
                <p className={cx("mt-2 text-lg", theme.textMuted)}>{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="py-20 sm:py-24 lg:py-28">
          <div className={containerClass}>
            <SectionIntro
              theme={theme}
              eyebrow="Everything you need"
              title="Built for serious learners"
              description="One platform. Two assessment tracks. Infinite ways to grow."
            />

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className={cx("rounded-[28px] border p-7 transition-colors", theme.card)}>
                  <div className="flex items-start justify-between gap-4">
                    <span className={cx("inline-flex h-12 w-12 items-center justify-center rounded-[18px]", theme.iconShell)}>
                      <Icon name={feature.icon} className="h-5 w-5" />
                    </span>
                    <span className={cx("rounded-full border px-3 py-1 text-xs font-medium", theme.badge)}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-8 text-[1.95rem] font-semibold tracking-[-0.04em]">{feature.title}</h3>
                  <p className={cx("mt-4 text-lg leading-8", theme.textMuted)}>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={cx("border-y py-20 sm:py-24 lg:py-28", theme.divider)}>
          <div className={containerClass}>
            <SectionIntro theme={theme} eyebrow="Simple process" title="How RankX works" description="" />

            <div className="mt-16 grid gap-12 xl:grid-cols-3 xl:gap-10">
              {steps.map((step) => (
                <article key={step.number} className="relative">
                  <p className={cx("text-[3.55rem] font-semibold tracking-[-0.07em]", theme.stepNumber)}>{step.number}</p>
                  <span className={cx("mt-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px]", theme.iconShell)}>
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-7 text-[2.05rem] font-semibold tracking-[-0.04em]">{step.title}</h3>
                  <p className={cx("mt-4 max-w-[360px] text-lg leading-8", theme.textMuted)}>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 sm:py-24 lg:py-28">
          <div className={containerClass}>
            <SectionIntro theme={theme} eyebrow="Learner stories" title="Trusted by top performers" description="" />

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.name} className={cx("rounded-[28px] border p-7 transition-colors", theme.card)}>
                  <div className="flex items-center gap-1.5 text-[#6f63ff]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Icon key={`${testimonial.name}-${index}`} name="star" className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="mt-8 text-[1.28rem] leading-9 tracking-[-0.02em]">"{testimonial.quote}"</p>
                  <div className="mt-8 flex items-center gap-4">
                    <span className={cx("inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold", theme.iconShell)}>
                      {testimonial.initials}
                    </span>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className={theme.textMuted}>{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="pb-20 pt-4 sm:pb-24 lg:pb-28">
          <div className={containerClass}>
            <SectionIntro
              theme={theme}
              eyebrow="Simple pricing"
              title="Start free, scale when ready"
              description="No credit card required to get started."
            />

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={cx(
                    "relative rounded-[30px] border p-8 transition-colors",
                    plan.featured ? theme.pricingFeatured : theme.card,
                  )}
                >
                  {plan.featured ? (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2a243a] shadow-sm">
                      Most Popular
                    </span>
                  ) : null}
                  <h3 className="text-[2rem] font-semibold tracking-[-0.04em]">{plan.name}</h3>
                  <p className={cx("mt-3 max-w-[280px] text-lg leading-8", plan.featured ? "text-white/82" : theme.textMuted)}>
                    {plan.description}
                  </p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-[4.1rem] font-semibold tracking-[-0.055em]">{plan.price}</span>
                    <span className={cx("pb-3 text-lg", plan.featured ? "text-white/82" : theme.textMuted)}>
                      {plan.suffix}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-4.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-lg">
                        <span
                          className={cx(
                            "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                            plan.featured ? "border-white/40 text-white" : "border-[#6f63ff]/30 text-[#6f63ff]",
                          )}
                        >
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.name === "Team" ? "/login" : "/register"}
                    className={cx(
                      "mt-10 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold transition-colors",
                      getPricingButtonClass(theme, plan.featured),
                    )}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cx("py-16 sm:py-20 lg:py-24", theme.divider)}>
          <div className={containerClass}>
            <div className={cx("rounded-[32px] border px-6 py-12 text-center sm:px-10 lg:px-14 lg:py-16 transition-colors", theme.card)}>
              <span className={cx("mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[20px]", theme.iconShell)}>
                <Icon name="book" className="h-6 w-6" />
              </span>
              <h2 className="mt-8 text-[2.6rem] font-semibold tracking-[-0.045em] sm:text-[3.4rem]">
                Ready to rank up?
              </h2>
              <p className={cx("mx-auto mt-5 max-w-[720px] text-xl leading-8", theme.textMuted)}>
                Join thousands of learners using RankX to become better engineers, faster. Start free today.
              </p>
              <Link
                to="/register"
                className={cx("mt-10 inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold transition-colors", theme.primaryButton)}
              >
                Start for Free
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={cx("relative z-10", theme.footer)}>
        <div className={cx(containerClass, "py-14 sm:py-16")}>
          <div className="grid gap-12 xl:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
            <div>
              <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
                <span className={cx("flex h-11 w-11 items-center justify-center rounded-2xl", theme.primaryButton)}>
                  <Icon name="book" className="h-4 w-4" />
                </span>
                <span className="text-[1.55rem] leading-none">RankX</span>
              </Link>
              <p className={cx("mt-6 max-w-[320px] text-lg leading-8", theme.textMuted)}>
                Premium coding practice and quiz assessment for serious learners.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <ul className={cx("mt-5 space-y-3 text-lg", theme.textMuted)}>
                  {column.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={cx("mt-12 flex flex-col gap-4 border-t pt-8 text-sm sm:flex-row sm:items-center sm:justify-between", theme.divider, theme.footerText)}>
            <p>@ 2026 RankX. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
