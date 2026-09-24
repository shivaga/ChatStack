import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDocuments, uploadDocument } from "../api/document.api";
const documentQueryKey = (tenantId: string) => ["documents", tenantId] as const;
export function useDocuments(tenantId: string | null, apiKey: string) { return useQuery({ queryKey: documentQueryKey(tenantId ?? "none"), queryFn: () => listDocuments(apiKey), enabled: Boolean(tenantId && apiKey), refetchInterval: 4_000 }); }
export function useUploadDocument(tenantId: string | null, apiKey: string) { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ file, title }: { file: File; title?: string }) => uploadDocument(apiKey, file, title), onSuccess: () => queryClient.invalidateQueries({ queryKey: documentQueryKey(tenantId ?? "none") }) }); }
