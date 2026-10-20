"use client";
import { AuthForm } from "@/components/auth-form";

import Link from "next/link";
import { useLogin } from "@/hooks/features/use-auth";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { APP_REDIRECT_TO_KEY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  mfaCode: z.string().optional(), // Optional field for MFA code
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { setAuthState, clearAuthState } = useAuthStore();
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [code, setCode] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });
  const { handleSubmit } = form;

  const onSubmit = async (values: LoginValues) => {
    await login.mutateAsync(values, {
      onSuccess: async (res) => {
        if (res.accessToken) {
          const sessionResponse = await fetch("/api/auth/session", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            }),
          });

          if (!sessionResponse.ok) {
            throw new Error("Unable to create authenticated session");
          }

          setAuthState({ user: res.user });
          const redirectTo = localStorage.getItem(APP_REDIRECT_TO_KEY);
          localStorage.removeItem(APP_REDIRECT_TO_KEY);
          router.replace(redirectTo ?? "/dashboard");
        } else if (res.user?.mfaRequired) {
          setIsMfaRequired(true);
        }
      },
      onError: () => {
        clearAuthState();
      },
    });
  };

  const submitWithMfaCode = () => {
    onSubmit({
      email: form.getValues("email"),
      password: form.getValues("password"),
      mfaCode: code,
    });
  };

  if (isMfaRequired) {
    return (
      <AuthForm
        title="Two-factor authentication required"
        subtitle="Please enter the 6-digit code from your authenticator app."
      >
        <div className="space-y-4">
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="w-full text-center font-plexmono text-lg tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <AppButton
            type="submit"
            className="w-full bg-lc-stamp text-lc-paper hover:bg-lc-stamp-dark"
            loading={login.isPending}
            loadingText="Verifying..."
            disabled={code.length !== 6}
            onClick={submitWithMfaCode}
          >
            Verify code
          </AppButton>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Sign up
          </Link>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              className="w-full"
              placeholder="Email address"
              label="Email address"
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              className="w-full"
              placeholder="Password"
              label="Password"
            />
            <div className="text-end">
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm text-lc-slate underline underline-offset-2 hover:text-lc-ink"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <AppButton
            type="submit"
            className="w-full bg-lc-stamp text-lc-paper hover:bg-lc-stamp-dark"
            loading={login.isPending}
            loadingText="Signing in..."
          >
            Sign in
          </AppButton>
        </form>
      </FormProvider>
    </AuthForm>
  );
}
