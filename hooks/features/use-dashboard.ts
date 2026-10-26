import { dashboardAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const DASHBOARD_QUERY_KEY = "dashboard";

export const useDashboard = () => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: dashboardAPI.getDashboard,
  });
};

export const useActivity = (limit?: number) => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, "activity", limit],
    queryFn: () => dashboardAPI.getActivity({ limit }),
  });
};
