"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RiCustomerService2Line } from "@remixicon/react";

import { AuthForm } from "@/components/auth-form";

const REASONS: Record<string, { title: string; subtitle: string }> = {
  ORG_SUSPENDED: {
    title: "Your firm's account is suspended",
    subtitle:
      "Access to the client portal is paused for everyone at this firm. Signing in again won't change that.",
  },
  ORG_ARCHIVED: {
    title: "Your firm's account is closed",
    subtitle:
      "This firm's LegalConnect account has been archived, so its client portal is no longer available.",
  },
};

export default function UnavailablePage() {
  return (
    <Suspense fallback={null}>
      <UnavailableNotice />
    </Suspense>
  );
}

function UnavailableNotice() {
  const reason = useSearchParams().get("reason") ?? "";
  const copy = REASONS[reason] ?? REASONS.ORG_SUSPENDED;

  return (
    <AuthForm
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link
          href="/login"
          className="font-medium text-lc-ink underline underline-offset-2"
        >
          Sign in with a different account
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-ink/12 bg-lc-paper-warm px-6 py-8 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-slate text-lc-slate">
          <RiCustomerService2Line className="h-5 w-5" />
        </span>
        <p className="text-sm text-lc-slate">
          Please contact your law firm or LegalConnect support for help.
        </p>
      </div>
    </AuthForm>
  );
}
