import type { ReactNode } from "react";
import { AppLogoDark, AppLogoLight } from "@/components/app-logo";

/** Small static docket stamp, reused (unanimated) across auth screens. */
function AuthStamp({ label = "VERIFIED" }: { label?: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-16 w-16 shrink-0 opacity-90">
      <defs>
        <filter id="auth-rough">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={3} />
        </filter>
      </defs>
      <g
        filter="url(#auth-rough)"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        className="text-lc-stamp"
      >
        <circle cx="100" cy="100" r="86" />
      </g>
      <text
        x="100"
        y="106"
        textAnchor="middle"
        fontFamily="var(--font-plex-mono)"
        fontSize="18"
        fontWeight={700}
        letterSpacing="1.5"
        className="fill-lc-stamp"
      >
        {label}
      </text>
    </svg>
  );
}

/** Decorative access-log ledger card, echoes the trust-ledger motif from the landing page. */
function AccessLedgerCard() {
  const entries = [
    { label: "Session opened", meta: "Chrome · Lagos, NG" },
    { label: "MFA verified", meta: "TOTP" },
    { label: "Password rotated", meta: "62 days ago" },
  ];

  return (
    <div className="w-full max-w-[360px] rounded-[3px] border border-lc-paper/15 bg-lc-paper/5 p-6">
      <div className="mb-4 font-plexmono text-[11px] tracking-wide text-lc-paper/60">
        ACCESS LOG
      </div>
      <div className="space-y-0">
        {entries.map((e, i) => (
          <div
            key={e.label}
            className={[
              "flex items-center justify-between py-3 text-[13px]",
              i !== entries.length - 1 ? "border-b border-lc-paper/10" : "",
            ].join(" ")}
          >
            <span className="text-lc-paper/85">{e.label}</span>
            <span className="font-plexmono text-[11px] text-lc-paper/45">
              {e.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — decorative, hidden below lg */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-lc-ledger-dark px-12 py-14 lg:flex">
        <AppLogoDark />
        <div>
          <p className="font-plexmono text-[11px] font-semibold uppercase tracking-[0.14em] text-lc-stamp">
            The Law Firm Operating System
          </p>
          <h2 className="mt-4 max-w-[380px] font-newsreader text-[34px] font-medium leading-[1.12] text-lc-paper">
            Every session,
            <br />
            on the record.
          </h2>
          <p className="mt-4 max-w-[340px] text-[14px] leading-relaxed text-lc-paper/60">
            Role-based access, MFA, and an audit log on every entity — the same
            compliance backbone that runs the rest of the firm.
          </p>
        </div>

        <div className="flex items-end justify-between">
          <AccessLedgerCard />
          <AuthStamp />
        </div>
      </div>

      {/* Right panel — the actual auth form */}
      <div className="flex flex-col items-center justify-center bg-lc-paper px-6 py-14">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <AppLogoLight />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
