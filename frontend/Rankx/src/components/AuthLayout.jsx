import { Link } from "react-router-dom";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m6.5 12.3 3.2 3.2 7.8-8" />
    </svg>
  );
}

function BrandMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 19V7.8c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2V19" />
      <path d="M3.5 19.5h17" />
      <path d="M8.5 19V10.5h7V19" />
      <path d="M9 9h.01M12 9h.01M15 9h.01" />
    </svg>
  );
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  topPrompt,
  topActionLabel,
  topActionTo,
  sideTag,
  sideTitle,
  sideDescription,
  sideStats = [],
  sideBullets = [],
  sideQuote,
  sideFooter,
  stepIndicator,
}) {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.12),transparent_18%),linear-gradient(180deg,#7c69ff_0%,#735fff_32%,#6959f4_100%)] px-5 py-6 sm:px-8 sm:py-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-10 lg:py-10 xl:px-14 xl:py-12">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_30%_75%,rgba(255,255,255,0.08),transparent_18%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <Link to="/" className="inline-flex items-center gap-3 font-semibold tracking-tight text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/18 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                <BrandMark />
              </span>
              <span className="text-lg">RankX</span>
            </Link>

            <div className="mt-14 lg:mt-20 xl:mt-24">
              {sideTag ? (
                <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/88">
                  {sideTag}
                </div>
              ) : null}

              <h1 className="mt-6 max-w-[520px] text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-[3.4rem] xl:text-[4.35rem]">
                {sideTitle}
              </h1>

              <p className="mt-5 max-w-[540px] text-base leading-8 text-white/78 sm:text-lg">
                {sideDescription}
              </p>

              {sideStats.length ? (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {sideStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[24px] border border-white/16 bg-white/8 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
                    >
                      <p className="text-[2rem] font-semibold tracking-[-0.05em] text-white">{stat.value}</p>
                      <p className="mt-1 text-sm text-white/70">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {sideBullets.length ? (
                <ul className="mt-10 space-y-4">
                  {sideBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm leading-7 text-white/82 sm:text-base">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/24 bg-white/12 text-white">
                        <CheckIcon />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {(sideQuote || sideFooter) ? (
              <div className="relative z-10 mt-12 flex-1 lg:mt-auto">
                {sideQuote ? (
                  <div className="rounded-[28px] border border-white/16 bg-white/10 p-6 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="mb-4 flex gap-1 text-[#ffd35f]">{"★★★★★"}</div>
                    <p className="text-sm leading-7 text-white/86 sm:text-base">"{sideQuote.quote}"</p>
                    <div className="mt-5 flex items-center gap-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/12 text-xs font-semibold text-white">
                        {sideQuote.initials}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{sideQuote.name}</p>
                        <p className="text-xs text-white/68">{sideQuote.role}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {sideFooter ? (
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {sideFooter.avatars?.length ? (
                      <div className="flex items-center">
                        {sideFooter.avatars.map((person, index) => (
                          <span
                            key={person}
                            className="relative -ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/14 text-xs font-semibold text-white first:ml-0"
                            style={{ zIndex: sideFooter.avatars.length - index }}
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div>
                      <p className="text-sm font-semibold text-white">{sideFooter.title}</p>
                      {sideFooter.caption ? <p className="text-sm text-white/72">{sideFooter.caption}</p> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="relative flex min-h-[48vh] flex-col bg-[#0c1017] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 xl:px-16 xl:py-12">
          <div className="flex justify-end">
            {topPrompt && topActionLabel && topActionTo ? (
              <div className="flex items-center gap-3 text-sm text-[#8290a9]">
                <span>{topPrompt}</span>
                <Link
                  to={topActionTo}
                  className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/[0.03]"
                >
                  {topActionLabel}
                </Link>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 items-center justify-center py-10 lg:py-0">
            <div className="w-full max-w-[430px]">
              {stepIndicator ? <div className="mb-8">{stepIndicator}</div> : null}
              <h2 className="text-[2.35rem] font-semibold leading-tight tracking-[-0.045em] text-white sm:text-[2.8rem]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#8290a9] sm:text-[0.96rem]">{subtitle}</p>
              <div className="mt-9">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
