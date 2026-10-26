import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AuthResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogin() {
  return useMutation({
    mutationFn: authAPI.login,
    // The login page shows errors inline (firm picker, portal off, suspended firm) instead of a toast.
    onError: () => {},
  });
}

/** Stores the session cookies and the user, so login and invitation acceptance land the same way. */
export function useStartSession() {
  const setAuthState = useAuthStore((state) => state.setAuthState);

  return async (res: AuthResponse) => {
    await authAPI.createSession(res);
    setAuthState({ user: res.user });
  };
}

export function useRegister() {
  return useMutation({
    mutationFn: authAPI.register,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authAPI.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authAPI.resetPassword,
  });
}

export function useEnableMFA() {
  return useMutation({
    mutationFn: authAPI.enableMFA,
  });
}

export function useVerifyMFA() {
  return useMutation({
    mutationFn: authAPI.verifyMFA,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearAuthState);

  return useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      clearAuthState();
      // Don't let the next client who signs in on this browser see cached data.
      queryClient.clear();
      router.replace("/login");
    },
  });
}

export const useAcceptInvitation = () => {
  return useMutation({
    mutationFn: authAPI.acceptInvite,
    // The page shows an inline message instead.
    onError: () => {},
  });
};
