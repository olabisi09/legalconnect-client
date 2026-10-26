"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";

import { AuthForm } from "@/components/auth-form";
import { FormInput } from "@/components/forms/form-input";
import { AppButton } from "@/components/app-button";
import { useResetPassword } from "@/hooks/features/use-auth";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const [isDone, setIsDone] = useState(false);

  const token = searchParams.get("token") ?? "";

  const form = useForm<ResetValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async ({ password }: ResetValues) => {
    await resetPassword.mutateAsync({ password, token });
    setIsDone(true);
  };

  const signInLink = (
    <Link
      href="/login"
      className="font-medium text-lc-ink underline underline-offset-2"
    >
      Back to sign in
    </Link>
  );

  if (!token) {
    return (
      <AuthForm
        title="Reset link incomplete"
        subtitle="This link is missing its reset token."
        footer={
          <Link
            href="/forgot-password"
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Request a new link
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-stamp/30 bg-lc-stamp/5 px-6 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-stamp text-lc-stamp">
            <RiErrorWarningLine className="h-5 w-5" />
          </span>
          <p className="text-sm text-lc-slate">
            Open the link from your most recent reset email, or request a new
            one.
          </p>
        </div>
      </AuthForm>
    );
  }

  if (isDone) {
    return (
      <AuthForm
        title="Password updated"
        subtitle="You can now sign in with your new password."
        footer={signInLink}
      >
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-lc-ink/12 bg-lc-paper-warm px-6 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-lc-ledger text-lc-ledger">
            <RiCheckboxCircleLine className="h-5 w-5" />
          </span>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Choose a new password"
      subtitle="Use at least 8 characters."
      footer={signInLink}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <FormInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full"
              placeholder="New password"
              label="New password"
            />
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full"
              placeholder="Repeat new password"
              label="Confirm password"
            />
          </div>

          <AppButton
            type="submit"
            className="w-full bg-lc-stamp text-lc-paper hover:bg-lc-stamp-dark"
            loading={resetPassword.isPending}
            loadingText="Updating password..."
          >
            Update password
          </AppButton>
        </form>
      </FormProvider>
    </AuthForm>
  );
}
