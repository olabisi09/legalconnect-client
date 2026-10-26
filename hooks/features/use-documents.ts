import { documentsAPI } from "@/lib/api";
import { downloadDocumentFile } from "@/lib/download";
import { DocumentListParams } from "@/types/document";
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

const DOCUMENTS_QUERY_KEY = "documents";

export const useCaseDocuments = (
  caseId: string,
  params: DocumentListParams = {},
) => {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, caseId, params],
    queryFn: () => documentsAPI.getCaseDocuments(caseId, params),
    placeholderData: keepPreviousData,
  });
};

export const useDocument = (documentId: string | null) => {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, "detail", documentId],
    queryFn: () => documentsAPI.getDocument(documentId!),
    enabled: !!documentId,
  });
};

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: documentsAPI.download,
    onSuccess: ({ blob, fileName }) => downloadDocumentFile(blob, fileName),
  });
};
