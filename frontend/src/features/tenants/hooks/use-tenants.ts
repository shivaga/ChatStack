import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTenant, listTenants } from "../api/tenant.api";
const tenantQueryKey = ["tenants"] as const;
export function useTenants() { return useQuery({ queryKey: tenantQueryKey, queryFn: listTenants }); }
export function useCreateTenant() { const queryClient = useQueryClient(); return useMutation({ mutationFn: createTenant, onSuccess: () => queryClient.invalidateQueries({ queryKey: tenantQueryKey }) }); }
