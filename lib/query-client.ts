import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeApiError } from "./error";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
      mutations: {
        retry: 0,
        onError: (error) => {
          toast.error(normalizeApiError(error).message);
        },
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
};
