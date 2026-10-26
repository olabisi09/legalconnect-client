"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { RiErrorWarningLine } from "@remixicon/react";

import { AuthForm } from "@/components/auth-form";
import { FormInput } from "@/components/forms/form-input";
import { AppButton } from "@/components/app-button";
import { useAcceptInvitation, useStartSession } from "@/hooks/features/use-auth";
import { normalizeApiError } from "@/lib/error";
import { capitalize } from "@/lib/utils";

const acceptSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AcceptValues = z.infer<typeof acceptSchema>;

function acceptErrorMessage(error: unknown): string {
  const { status } = normalizeApiError(error);
  if (status === 404) {
    return "The client portal is currently unavailable. Please try again later.";
  }
  if (status === 409) {
    return "This invitation has already been accepted. Sign in instead.";
  }
  return "That invite link may have expired. Ask your firm to resend it.";
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitationForm />
    </Suspense>
  );
}

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startSession = useStartSession();
  const acceptInvitation = useAcceptInvitation();
  const [formError, setFormError] = useState<string | null>(null);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  // Since 20 Oct links carry type/role/firm; older links have no type and are client invites here.
  const type = searchParams.get("type");
  const firm = searchParams.get("firm");
  const role = searchParams.get("role");

  const form = useForm<AcceptValues>({
    defaultValues: { password: "" },
    resolver: zodResolver(acceptSchema),
  });
  const { handleSubmit } = form;

  const onSubmit = async (values: AcceptValues) => {
    setFormError(null);
    try {
      const res = await acceptInvitation.mutateAsync({
        ...values,
        token,
        email,
      });

      // Same shape as login — establish the session the same way the login page does.
      await startSession(res);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(acceptErrorMessage(error));
    }
  };

  if (type === "staff") {
    return (
      <AuthForm
        title="Wrong portal"
        subtitle="This is a staff invitation. Open it in your firm's LegalConnect workspace instead."
        footer={
          <Link
            href="/login"
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-stamp/30 bg-lc-stamp/5 px-6 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-stamp text-lc-stamp">
            <RiErrorWarningLine className="h-5 w-5" />
          </span>
          <p className="text-sm text-lc-slate">
            The client portal only accepts client invitations.
          </p>
        </div>
      </AuthForm>
    );
  }

  if (!token || !email) {
    return (
      <AuthForm
        title="Invite link incomplete"
        subtitle="This link is missing information and can't be used to sign up."
        footer={
          <Link
            href="/login"
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-stamp/30 bg-lc-stamp/5 px-6 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-stamp text-lc-stamp">
            <RiErrorWarningLine className="h-5 w-5" />
          </span>
          <p className="text-sm text-lc-slate">
            Ask your law firm to send you a new invitation.
          </p>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="You've been invited"
      subtitle={
        firm
          ? `${firm} has invited you to their client portal. Set a password to get started.`
          : `Set a password to join as ${email}.`
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Sign in
          </Link>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="rounded-[3px] border border-lc-ink/12 bg-lc-paper-warm px-3.5 py-2.5">
              <p className="font-plexmono text-[10.5px] uppercase tracking-wide text-lc-slate">
                Email
              </p>
              <p className="mt-0.5 text-sm text-lc-ink">{email}</p>
              {role ? (
                <p className="mt-1 font-plexmono text-[10.5px] text-lc-slate">
                  {role.split("_").map(capitalize).join(" ")}
                </p>
              ) : null}
            </div>

            <FormInput
              id="password"
              name="password"
              type="password"
              className="w-full"
              placeholder="Create a password"
              autoComplete="new-password"
              label="Password"
            />
          </div>

          {formError ? (
            <p className="text-sm text-lc-stamp">{formError}</p>
          ) : null}

          <AppButton
            type="submit"
            className="w-full bg-lc-stamp text-lc-paper hover:bg-lc-stamp-dark"
            loading={acceptInvitation.isPending}
            loadingText="Setting up your account..."
          >
            Accept invite and sign in
          </AppButton>
        </form>
      </FormProvider>
    </AuthForm>
  );
}
