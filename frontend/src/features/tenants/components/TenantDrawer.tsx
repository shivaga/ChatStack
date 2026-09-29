import { useState } from "react";
import { CreateTenantForm } from "./CreateTenantForm";
import type { Tenant } from "../types/tenant";

type Props = {
  isOpen: boolean;
  tenants: Tenant[];
  selectedTenantId: string;
  isCreating: boolean;
  error: string | null;
  onClose: () => void;
  onSelect: (tenantId: string) => void;
  onCreate: (name: string) => Promise<void>;
};

export function TenantDrawer(props: Props) {
  const [showCreate, setShowCreate] = useState(false);
  if (!props.isOpen) return null;

  return <>
    <button className="drawer-scrim" type="button" aria-label="Close tenant drawer" onClick={props.onClose} />
    <aside className="tenant-drawer" aria-label="Tenant selection">
      <div className="drawer-header"><div><span className="overline">Your workspaces</span><h2>{showCreate ? "Create tenant" : "Select tenant"}</h2></div><button className="icon-button" type="button" onClick={props.onClose} aria-label="Close tenant drawer">×</button></div>
      {showCreate ? <div className="drawer-create"><p>Create an isolated knowledge base. Its private API key will be shown once.</p><CreateTenantForm isSubmitting={props.isCreating} onSubmit={props.onCreate} />{props.error && <p className="error" role="alert">{props.error}</p>}<button className="quiet-button" type="button" onClick={() => setShowCreate(false)}>← Back to tenants</button></div> : <>
        <div className="tenant-options">{props.tenants.length === 0 ? <p className="drawer-empty">No tenants yet.</p> : props.tenants.map((tenant) => <button className={`tenant-option ${tenant.id === props.selectedTenantId ? "selected" : ""}`} type="button" key={tenant.id} onClick={() => { props.onSelect(tenant.id); props.onClose(); }}><span><strong>{tenant.name}</strong><small>Widget key: {tenant.publicWidgetKey}</small></span><span>{tenant.id === props.selectedTenantId ? "✓" : "→"}</span></button>)}</div>
        <button className="create-tenant-button" type="button" onClick={() => setShowCreate(true)}>+ Create a tenant</button>
      </>}
    </aside>
  </>;
}
