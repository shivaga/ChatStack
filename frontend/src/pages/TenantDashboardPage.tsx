import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { ApiKeyNotice } from "../features/tenants/components/ApiKeyNotice";
import { CreateTenantForm } from "../features/tenants/components/CreateTenantForm";
import { TenantList } from "../features/tenants/components/TenantList";
import { useCreateTenant, useTenants } from "../features/tenants/hooks/use-tenants";

export function TenantDashboardPage() {
  const tenantsQuery = useTenants();
  const createTenantMutation = useCreateTenant();
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreateTenant(name: string) {
    setFormError(null);
    try {
      const result = await createTenantMutation.mutateAsync(name);
      setIssuedKey(result.apiKey);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create the tenant.");
    }
  }

  return (
    <main>
      <AppHeader />
      <section className="hero">
        <p className="eyebrow">MULTI-TENANT KNOWLEDGE</p>
        <h1>Your tenant dashboard</h1>
        <p>Create isolated knowledge bases, upload source material, and deploy a secure chat widget.</p>
      </section>
      <section className="panel">
        <div className="section-title"><div><h2>Tenants</h2><p>Each tenant receives a server API key and a public widget key.</p></div></div>
        <CreateTenantForm isSubmitting={createTenantMutation.isPending} onSubmit={handleCreateTenant} />
        {formError && <p className="error" role="alert">{formError}</p>}
        {issuedKey && <ApiKeyNotice apiKey={issuedKey} onDismiss={() => setIssuedKey(null)} />}
        {tenantsQuery.isLoading && <p>Loading tenants...</p>}
        {tenantsQuery.isError && <p className="error" role="alert">Could not load tenants. Make sure the backend is running.</p>}
        {tenantsQuery.data && <TenantList tenants={tenantsQuery.data} />}
      </section>
    </main>
  );
}
