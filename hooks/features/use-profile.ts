import { profileAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PROFILE_QUERY_KEY = "profile";

export const useProfile = () => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: profileAPI.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileAPI.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData([PROFILE_QUERY_KEY], profile);

      // The sidebar and dashboard greeting read the name from the auth store.
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        setUser({
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      }
    },
  });
};
