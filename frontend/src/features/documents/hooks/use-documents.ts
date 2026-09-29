import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDocuments, uploadDocument } from "../api/document.api";
const documentQueryKey = (tenantId: string) => ["documents", tenantId] as const;
export function useDocuments(tenantId: string | null) { return useQuery({ queryKey: documentQueryKey(tenantId ?? "none"), queryFn: () => listDocuments(tenantId!), enabled: Boolean(tenantId), refetchInterval: 4_000 }); }
export function useUploadDocument(tenantId: string | null) { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ file, title }: { file: File; title?: string }) => uploadDocument(tenantId!, file, title), onSuccess: () => queryClient.invalidateQueries({ queryKey: documentQueryKey(tenantId ?? "none") }) }); }
