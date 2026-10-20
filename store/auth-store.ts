import { Permission } from "@/lib/permissions";
import { OrgRole } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrgRole;
  orgId: string | null;
  orgName: string | null;
  mfaRequired: boolean;
  permissions: Permission[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isHydrated: boolean;

  setAuthState: (state: { user: AuthState["user"] }) => void;
  setUser: (user: AuthState["user"]) => void;
  clearAuthState: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isHydrated: false,

      setAuthState: ({ user }) => set(() => ({ user, isAuthenticated: true })),
      setUser: (user) => set(() => ({ user })),
      clearAuthState: () => {
        set(() => ({
          isAuthenticated: false,
          user: null,
        }));

        if (typeof window !== "undefined") {
          void fetch("/api/auth/session", {
            method: "DELETE",
            credentials: "include",
          });
        }
      },
      setHydrated: (hydrated) => set(() => ({ isHydrated: hydrated })),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating auth store:", error);
        }
        state?.setHydrated(true);
      },
    },
  ),
);
