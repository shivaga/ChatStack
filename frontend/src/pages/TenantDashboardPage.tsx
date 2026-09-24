import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { ChatWorkspace } from "../features/chat/components/ChatWorkspace";
import { DocumentList } from "../features/documents/components/DocumentList";
import { DocumentUploadForm } from "../features/documents/components/DocumentUploadForm";
import { TenantAccessForm } from "../features/documents/components/TenantAccessForm";
import { useDocuments, useUploadDocument } from "../features/documents/hooks/use-documents";
import { ApiKeyNotice } from "../features/tenants/components/ApiKeyNotice";
import { CreateTenantForm } from "../features/tenants/components/CreateTenantForm";
import { TenantList } from "../features/tenants/components/TenantList";
import { useCreateTenant, useTenants } from "../features/tenants/hooks/use-tenants";

export function TenantDashboardPage() {
  const tenantsQuery = useTenants();
  const createTenantMutation = useCreateTenant();
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantApiKey, setTenantApiKey] = useState("");
  const [documentError, setDocumentError] = useState<string | null>(null);
  const documentsQuery = useDocuments(selectedTenantId || null, tenantApiKey);
  const uploadDocumentMutation = useUploadDocument(selectedTenantId || null, tenantApiKey);
  const selectedTenantName = tenantsQuery.data?.find((tenant) => tenant.id === selectedTenantId)?.name;

  async function handleCreateTenant(name: string) {
    setFormError(null);
    try {
      const result = await createTenantMutation.mutateAsync(name);
      setIssuedKey(result.apiKey);
      selectTenant(result.tenant.id, result.apiKey);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create the tenant.");
    }
  }

  function selectTenant(tenantId: string, apiKey?: string) {
    const savedKey = apiKey ?? sessionStorage.getItem(`chatstack:tenant-key:${tenantId}`) ?? "";
    setSelectedTenantId(tenantId);
    setTenantApiKey(savedKey);
    if (apiKey) sessionStorage.setItem(`chatstack:tenant-key:${tenantId}`, apiKey);
  }

  function saveTenantApiKey(apiKey: string) {
    setTenantApiKey(apiKey);
    if (selectedTenantId) sessionStorage.setItem(`chatstack:tenant-key:${selectedTenantId}`, apiKey);
  }

  async function handleUpload(file: File, title?: string) {
    setDocumentError(null);
    try { await uploadDocumentMutation.mutateAsync({ file, title }); }
    catch (error) { setDocumentError(error instanceof Error ? error.message : "Could not upload the document."); }
  }

  return (
    <main>
      <AppHeader />
      <section className="hero">
        <p className="eyebrow">MULTI-TENANT KNOWLEDGE</p>
        <h1>Your tenant dashboard</h1>
        <p>Create isolated knowledge bases, upload source material, and deploy a secure chat widget.</p>
      </section>
      <section className="panel document-panel">
        <div className="section-title"><div><h2>Documents</h2><p>Use the selected tenant’s private API key. Status refreshes automatically while this page is open.</p></div></div>
        <TenantAccessForm tenants={tenantsQuery.data ?? []} selectedTenantId={selectedTenantId} apiKey={tenantApiKey} onTenantChange={selectTenant} onApiKeyChange={saveTenantApiKey} />
        <DocumentUploadForm disabled={!selectedTenantId || !tenantApiKey} isUploading={uploadDocumentMutation.isPending} onUpload={handleUpload} />
        {documentError && <p className="error" role="alert">{documentError}</p>}
        {!selectedTenantId && <div className="empty">Select a tenant and provide its private API key to manage documents.</div>}
        {selectedTenantId && !tenantApiKey && <div className="empty">Paste the selected tenant’s private API key to load and upload documents.</div>}
        {documentsQuery.isLoading && <p>Loading documents...</p>}
        {documentsQuery.isError && <p className="error" role="alert">Could not load documents. Check that this key belongs to the selected tenant.</p>}
        {documentsQuery.data && <DocumentList documents={documentsQuery.data} />}
      </section>
      <ChatWorkspace enabled={Boolean(selectedTenantId && tenantApiKey)} apiKey={tenantApiKey} tenantName={selectedTenantName} />
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
