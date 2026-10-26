"use client";

import { useState } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { RiMailSendLine } from "@remixicon/react";

import { AuthForm } from "@/components/auth-form";
import { FormInput } from "@/components/forms/form-input";
import { AppButton } from "@/components/app-button";
import { useForgotPassword } from "@/hooks/features/use-auth";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const backToLogin = (
  <Link
    href="/login"
    className="font-medium text-lc-ink underline underline-offset-2"
  >
    Back to sign in
  </Link>
);

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async ({ email }: ForgotValues) => {
    await forgotPassword.mutateAsync({ email });
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <AuthForm
        title="Check your email"
        subtitle={`If ${sentTo} has a client portal account, we've sent a link to reset the password.`}
        footer={backToLogin}
      >
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-ink/12 bg-lc-paper-warm px-6 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-ledger text-lc-ledger">
            <RiMailSendLine className="h-5 w-5" />
          </span>
          <p className="text-sm text-lc-slate">
            If you&apos;re a client of more than one firm, you&apos;ll get one
            email for each account.
          </p>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset your password"
      subtitle="Enter the email you use for the client portal and we'll send you a reset link."
      footer={backToLogin}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full"
            placeholder="Email address"
            label="Email address"
          />

          <AppButton
            type="submit"
            className="w-full bg-lc-stamp text-lc-paper hover:bg-lc-stamp-dark"
            loading={forgotPassword.isPending}
            loadingText="Sending link..."
          >
            Send reset link
          </AppButton>
        </form>
      </FormProvider>
    </AuthForm>
  );
}
