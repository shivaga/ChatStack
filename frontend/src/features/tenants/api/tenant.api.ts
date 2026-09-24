import { apiRequest } from "../../../api/http-client";
import type { CreateTenantResult, Tenant, TenantApiResponse } from "../types/tenant";
type ListTenantsResponse = { tenants: TenantApiResponse[] };
type CreateTenantResponse = { tenant: TenantApiResponse; apiKey: string; warning?: string };
function toTenant(tenant: TenantApiResponse): Tenant { return { id: tenant.id, name: tenant.name, publicWidgetKey: tenant.public_widget_key, createdAt: tenant.created_at }; }
export async function listTenants(): Promise<Tenant[]> { return (await apiRequest<ListTenantsResponse>("/api/tenants")).tenants.map(toTenant); }
export async function createTenant(name: string): Promise<CreateTenantResult> { const response = await apiRequest<CreateTenantResponse>("/api/tenants", { method: "POST", body: JSON.stringify({ name }) }); return { tenant: toTenant(response.tenant), apiKey: response.apiKey, warning: response.warning }; }
