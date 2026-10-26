"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { RiErrorWarningLine } from "@remixicon/react";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AppButton } from "@/components/app-button";
import { AppEmpty } from "@/components/app-empty";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/hooks/features/use-profile";
import { useAuthStore } from "@/store/auth-store";
import { capitalize, getInitials } from "@/lib/utils";
import type { ClientProfile } from "@/types/profile";

// Limits mirror the backend's column sizes.
const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.string().trim().max(50, "Phone number is too long"),
  locale: z.string().max(10),
  timezone: z.string().max(50),
});

type ProfileValues = z.infer<typeof profileSchema>;

const LOCALES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "fr-FR", label: "Français (France)" },
];

function timezoneOptions(current?: string) {
  const zones = new Set(Intl.supportedValuesOf("timeZone"));
  zones.add("UTC");
  if (current) zones.add(current);
  return [...zones].sort().map((zone) => ({ value: zone, label: zone }));
}

function toFormValues(profile?: ClientProfile): ProfileValues {
  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    phone: profile?.phone ?? "",
    locale: profile?.locale ?? "en-US",
    timezone: profile?.timezone ?? "UTC",
  };
}

function formatRole(role?: string) {
  return role ? role.split("_").map(capitalize).join(" ") : "—";
}

export function ProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const user = useAuthStore((state) => state.user);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    // `values` keeps the form in sync once the profile loads (and after a save).
    values: toFormValues(profile),
  });

  const localeOptions = useMemo(() => {
    const current = profile?.locale;
    return current && !LOCALES.some((l) => l.value === current)
      ? [...LOCALES, { value: current, label: current }]
      : LOCALES;
  }, [profile?.locale]);

  const timezones = useMemo(
    () => timezoneOptions(profile?.timezone),
    [profile?.timezone],
  );

  const onSubmit = async (values: ProfileValues) => {
    await updateProfile.mutateAsync(values);
    toast.success("Profile updated");
  };

  if (isError) {
    return (
      <DashboardCard>
        <CardContent className="py-10">
          <AppEmpty
            title="Couldn't load your profile"
            description="Something went wrong while fetching your details."
            icon={<RiErrorWarningLine />}
          >
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </AppEmpty>
        </CardContent>
      </DashboardCard>
    );
  }

  const fullName = `${profile?.firstName ?? user?.firstName ?? ""} ${
    profile?.lastName ?? user?.lastName ?? ""
  }`.trim();

  return (
    <div className="grid grid-cols-1 gap-px bg-border p-px lg:grid-cols-3">
      <DashboardCard>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Set by your law firm.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-sm">
              <AvatarFallback className="rounded-sm bg-lc-paper-warm font-plexmono text-sm text-lc-slate">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="truncate font-newsreader text-lg font-medium">
                  {fullName || "—"}
                </p>
              )}
              <p className="truncate text-xs text-muted-foreground">
                {profile?.email ?? user?.email}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
            <dt className="font-plexmono text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Firm
            </dt>
            <dd className="truncate">{user?.firmName ?? "—"}</dd>
            <dt className="font-plexmono text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Role
            </dt>
            <dd>{formatRole(user?.role)}</dd>
          </dl>

          <p className="text-xs text-muted-foreground">
            To change your email address or role, contact your law firm.
          </p>
        </CardContent>
      </DashboardCard>

      <DashboardCard className="lg:col-span-2">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>
                How you appear to your firm, and how dates and times are shown
                to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    name="firstName"
                    label="First name"
                    autoComplete="given-name"
                  />
                  <FormInput
                    name="lastName"
                    label="Last name"
                    autoComplete="family-name"
                  />
                  <FormInput
                    name="phone"
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 800 000 0000"
                  />
                  <div className="hidden sm:block" />
                  <FormSelect
                    name="locale"
                    label="Language & region"
                    options={localeOptions}
                    items={localeOptions}
                  />
                  <FormSelect
                    name="timezone"
                    label="Time zone"
                    options={timezones}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2 rounded-none border-t bg-background">
              <Button
                type="button"
                variant="ghost"
                disabled={!form.formState.isDirty || updateProfile.isPending}
                onClick={() => form.reset(toFormValues(profile))}
              >
                Discard changes
              </Button>
              <AppButton
                type="submit"
                disabled={isLoading || !form.formState.isDirty}
                loading={updateProfile.isPending}
                loadingText="Saving..."
              >
                Save changes
              </AppButton>
            </CardFooter>
          </form>
        </FormProvider>
      </DashboardCard>
    </div>
  );
}
