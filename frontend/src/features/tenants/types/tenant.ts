export type Tenant = { id: string; name: string; publicWidgetKey: string; createdAt: string };
export type TenantApiResponse = { id: string; name: string; public_widget_key: string; created_at: string };
export type CreateTenantResult = { tenant: Tenant; apiKey: string; warning?: string };
