import { useEffect, useState } from "react";
import { ChatWorkspace } from "../features/chat/components/ChatWorkspace";
import { DocumentList } from "../features/documents/components/DocumentList";
import { DocumentUploadForm } from "../features/documents/components/DocumentUploadForm";
import { useDocuments, useUploadDocument } from "../features/documents/hooks/use-documents";
import { TenantDrawer } from "../features/tenants/components/TenantDrawer";
import { useCreateTenant, useTenants } from "../features/tenants/hooks/use-tenants";
import { useAuth } from "../features/auth/context/AuthContext";

export function TenantDashboardPage() {
  const tenantsQuery = useTenants();
  const { user, signOut } = useAuth();
  const createTenantMutation = useCreateTenant();
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantDrawerOpen, setTenantDrawerOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const documentsQuery = useDocuments(selectedTenantId || null);
  const uploadDocumentMutation = useUploadDocument(selectedTenantId || null);
  const selectedTenant = tenantsQuery.data?.find((tenant) => tenant.id === selectedTenantId);
  const documents = documentsQuery.data ?? [];
  const readyCount = documents.filter((document) => document.status === "ready").length;
  const processingCount = documents.filter((document) => document.status === "pending" || document.status === "processing").length;

  useEffect(() => {
    if (!selectedTenantId && tenantsQuery.data?.[0]) setSelectedTenantId(tenantsQuery.data[0].id);
  }, [selectedTenantId, tenantsQuery.data]);

  function selectTenant(tenantId: string) {
    setSelectedTenantId(tenantId);
    setDocumentError(null);
  }

  async function createTenant(name: string) {
    setTenantError(null);
    try {
      const result = await createTenantMutation.mutateAsync(name);
      selectTenant(result.tenant.id);
    } catch (error) {
      setTenantError(error instanceof Error ? error.message : "Could not create the tenant.");
    }
  }

  async function uploadDocument(file: File, title?: string) {
    setDocumentError(null);
    try { await uploadDocumentMutation.mutateAsync({ file, title }); }
    catch (error) { setDocumentError(error instanceof Error ? error.message : "Could not upload the document."); }
  }

  return <div className="app-shell">
    <header className="masthead"><div className="brand-group"><button className="nav-trigger" type="button" onClick={() => setTenantDrawerOpen(true)} aria-label="Open tenant selection">☰</button><span className="brand">ChatStack</span></div><div className="masthead-context"><span>Tenant workspace</span><strong>{selectedTenant?.name ?? "No tenant selected"}</strong></div><div className="profile-placeholder"><span>{String(user?.user_metadata.full_name ?? user?.email ?? "Signed-in user")}</span><span className="avatar">{String(user?.user_metadata.full_name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}</span><button className="sign-out" type="button" onClick={() => void signOut()}>Sign out</button></div></header>

    <main className="workspace">
      {!selectedTenant ? <section className="welcome-state"><span className="overline">Multi-tenant knowledge</span><h1>Select a workspace to begin.</h1><p>Choose an existing tenant or create a new isolated knowledge base.</p><button className="primary-button" type="button" onClick={() => setTenantDrawerOpen(true)}>Select tenant</button></section> : <>
        <div className="workspace-heading"><div><span className="overline">Source library</span><h1>{selectedTenant.name}</h1><p>The documents ChatStack searches before answering for this tenant.</p></div><div className="heading-actions"><button className="secondary-button" type="button" onClick={() => setChatOpen(true)}>Ask knowledge base</button></div></div>
        <div className="metrics"><div><strong>{documents.length}</strong><span>documents</span></div><div><strong>{readyCount}</strong><span>ready for answers</span></div><div><strong>{processingCount}</strong><span>processing</span></div></div>
        <section className="library-section"><div className="library-header"><div><h2>Documents</h2><p>Status refreshes automatically while processing continues.</p></div></div><DocumentUploadForm disabled={false} isUploading={uploadDocumentMutation.isPending} onUpload={uploadDocument} />{documentError && <p className="error" role="alert">{documentError}</p>}{documentsQuery.isLoading && <p className="loading-copy">Loading documents…</p>}{documentsQuery.isError && <p className="error" role="alert">Could not load documents. Check that this private key belongs to {selectedTenant.name}.</p>}{documentsQuery.data && <DocumentList documents={documentsQuery.data} />}</section>
      </>}
    </main>

    <TenantDrawer isOpen={tenantDrawerOpen} tenants={tenantsQuery.data ?? []} selectedTenantId={selectedTenantId} isCreating={createTenantMutation.isPending} error={tenantError} onClose={() => setTenantDrawerOpen(false)} onSelect={selectTenant} onCreate={createTenant} />
    <ChatWorkspace isOpen={chatOpen} tenantId={selectedTenantId} tenantName={selectedTenant?.name} onClose={() => setChatOpen(false)} />
  </div>;
}
