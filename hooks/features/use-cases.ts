import { casesAPI } from "@/lib/api";
import { CaseListParams } from "@/types/case";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const CASES_QUERY_KEY = "cases";

export const useCases = (params: CaseListParams = {}) => {
  return useQuery({
    queryKey: [CASES_QUERY_KEY, params],
    queryFn: () => casesAPI.getCases(params),
    placeholderData: keepPreviousData,
  });
};

export const useCase = (caseId: string) => {
  return useQuery({
    queryKey: [CASES_QUERY_KEY, caseId],
    queryFn: () => casesAPI.getCase(caseId),
  });
};

export const useCaseTimeline = (
  caseId: string,
  params: { page?: number; size?: number } = {},
) => {
  return useQuery({
    queryKey: [CASES_QUERY_KEY, caseId, "timeline", params],
    queryFn: () => casesAPI.getTimeline(caseId, params),
    placeholderData: keepPreviousData,
  });
};

export const useCaseDeadlines = (caseId: string) => {
  return useQuery({
    queryKey: [CASES_QUERY_KEY, caseId, "deadlines"],
    queryFn: () => casesAPI.getDeadlines(caseId),
  });
};
