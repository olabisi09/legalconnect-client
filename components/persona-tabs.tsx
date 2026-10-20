"use client";

import { useState } from "react";

type Persona = {
  role: string;
  focus: string;
  without: string;
  with: string;
};

const personas: Persona[] = [
  {
    role: "Managing Partner",
    focus: "FIRM OVERSIGHT & GROWTH",
    without:
      "No visibility into firm performance, attorney capacity, or financial health until the numbers are already stale.",
    with: "Real-time dashboards, firm-wide reporting, and capacity planning at a glance — no month-end wait.",
  },
  {
    role: "Lawyer",
    focus: "MATTER MANAGEMENT",
    without:
      "Too many tools, too much admin — time spent on systems instead of clients.",
    with: "One place for matters, documents, time, and billing, so the focus stays on the law.",
  },
  {
    role: "Paralegal",
    focus: "DOCUMENTS & SCHEDULING",
    without:
      "Manual document organization and calendar coordination across multiple attorneys.",
    with: "Centralized document management per matter and one firm-wide calendar.",
  },
  {
    role: "Administrator",
    focus: "OPERATIONS & BILLING",
    without:
      "Chasing down time entries, reconciling trust accounts, managing user access by hand.",
    with: "Automated billing workflows, trust reconciliation, and centralized user management.",
  },
  {
    role: "Client",
    focus: "CASE TRANSPARENCY",
    without: "No visibility into case progress, documents, or billing.",
    with: "A client portal for matter updates, document access, and secure messaging.",
  },
];

export default function PersonaTabs() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 border-b border-lc-ink">
        {personas.map((p, i) => (
          <button
            key={p.role}
            onClick={() => setActive(i)}
            className={[
              "translate-y-px rounded-t-md border border-b-0 px-[18px] py-3 font-plexmono text-xs transition-colors",
              active === i
                ? "translate-y-0 border-lc-ink bg-lc-paper font-semibold text-lc-ink"
                : "border-lc-ink/15 bg-lc-paper-warm text-lc-slate hover:text-lc-ink",
            ].join(" ")}
          >
            {p.role}
          </button>
        ))}
      </div>

      {personas.map((p, i) =>
        active === i ? (
          <div
            key={p.role}
            className="grid grid-cols-1 gap-8 border border-t-0 border-lc-ink bg-lc-paper p-6 sm:p-9 md:grid-cols-2"
          >
            <div>
              <h3 className="font-newsreader text-2xl font-medium text-lc-ink">
                {p.role}
              </h3>
              <p className="mb-[18px] mt-1 font-plexmono text-[11.5px] text-lc-stamp">
                {p.focus}
              </p>
              <div className="border-l-2 border-lc-ink/10 pl-3.5">
                <div className="mb-1.5 font-plexmono text-[10.5px] uppercase tracking-wider text-lc-slate">
                  Without LegalConnect
                </div>
                <p className="text-sm leading-relaxed text-lc-ink">
                  {p.without}
                </p>
              </div>
            </div>
            <div className="border-l-2 border-lc-stamp pl-3.5 md:self-end">
              <div className="mb-1.5 font-plexmono text-[10.5px] uppercase tracking-wider text-lc-slate">
                With LegalConnect
              </div>
              <p className="text-sm leading-relaxed text-lc-ink">{p.with}</p>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
