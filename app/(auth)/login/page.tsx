"use client";
import { AuthForm } from "@/components/auth-form";

import Link from "next/link";
import { useLogin, useStartSession } from "@/hooks/features/use-auth";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { APP_REDIRECT_TO_KEY } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { Suspense, useState } from "react";
import { isOrgUnavailableError, normalizeApiError } from "@/lib/error";
import type { FirmOption } from "@/types/auth";
import { RiArrowRightSLine, RiBuilding2Line } from "@remixicon/react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

/** Only same-origin paths, so a crafted ?redirectTo= can't bounce users off-site. */
function safeRedirect(path: string | null): string | null {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : null;
}

function loginErrorMessage(error: unknown): string {
  const { status, message } = normalizeApiError(error);
  // The portal switch is app-wide; when it's off every /client/** call, login included, is a 404.
  if (status === 404) {
    return "The client portal is currently unavailable. Please try again later or contact your law firm.";
  }
  if (status === 401) return "Incorrect email or password.";
  return message || "We couldn't sign you in. Please try again.";
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const startSession = useStartSession();
  const clearAuthState = useAuthStore((state) => state.clearAuthState);
  const [formError, setFormError] = useState<string | null>(null);
  const [firms, setFirms] = useState<FirmOption[] | null>(null);
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });
  const { handleSubmit } = form;

  const signIn = async (values: LoginValues, firmSlug?: string) => {
    setFormError(null);
    try {
      const res = await login.mutateAsync({ ...values, firmSlug });
      await startSession(res);

      const storedRedirect = localStorage.getItem(APP_REDIRECT_TO_KEY);
      localStorage.removeItem(APP_REDIRECT_TO_KEY);
      router.replace(
        safeRedirect(searchParams.get("redirectTo")) ??
          safeRedirect(storedRedirect) ??
          "/dashboard",
      );
    } catch (error) {
      clearAuthState();
      const normalized = normalizeApiError(error);

      if (
        normalized.status === 409 &&
        (normalized.errorCode ?? normalized.code) === "MULTIPLE_FIRMS" &&
        Array.isArray(normalized.data)
      ) {
        setFirms(normalized.data as FirmOption[]);
        return;
      }

      if (isOrgUnavailableError(error)) {
        router.push(
          `/unavailable?reason=${normalized.errorCode ?? normalized.code}`,
        );
        return;
      }

      setFormError(loginErrorMessage(error));
    } finally {
      setSelectedFirm(null);
    }
  };

  const chooseFirm = (firmSlug: string) => {
    setSelectedFirm(firmSlug);
    void signIn(form.getValues(), firmSlug);
  };

  if (firms) {
    return (
      <AuthForm
        title="Choose your firm"
        subtitle="Your email is registered with more than one firm. Which portal do you want to open?"
        footer={
          <button
            type="button"
            onClick={() => {
              setFirms(null);
              setFormError(null);
            }}
            className="font-medium text-lc-ink underline underline-offset-2"
          >
            Use a different account
          </button>
        }
      >
        <div className="space-y-2">
          {firms.map((firm) => (
            <button
              key={firm.firmSlug}
              type="button"
              disabled={login.isPending}
              onClick={() => chooseFirm(firm.firmSlug)}
              className="flex w-full items-center gap-3 rounded-[3px] border border-lc-ink/12 bg-lc-paper-warm px-4 py-3 text-left transition-colors hover:border-lc-ink/30 disabled:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lc-ink/15 text-lc-slate">
                <RiBuilding2Line className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-lc-ink">
                {firm.firmName}
              </span>
              <span className="font-plexmono text-[11px] text-lc-slate">
                {selectedFirm === firm.firmSlug ? (
                  "Signing in..."
                ) : (
                  <RiArrowRightSLine className="h-4 w-4" />
                )}
              </span>
            </button>
          ))}

          {formError ? (
            <p className="pt-2 text-sm text-lc-stamp">{formError}</p>
          ) : null}
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your client portal"
      footer={
        <>
          New here? Your law firm will email you an invitation to set up your
          account.
        </>
      }
    >
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit((values) => signIn(values))}
          className="space-y-5"
        >
          <div className="space-y-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full"
              placeholder="Email address"
              label="Email address"
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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

          {formError ? (
            <p className="text-sm text-lc-stamp">{formError}</p>
          ) : null}

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
