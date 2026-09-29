-- Run once in the Supabase SQL editor for an existing ChatStack database.
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS tenant_memberships_user_idx ON tenant_memberships(user_id, tenant_id);

-- Preserve access to tenants created before authentication was added.
INSERT INTO tenant_memberships (tenant_id, user_id, role)
SELECT id, owner_id, 'owner' FROM tenants
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- The browser must use the Express API; it must not access tenant data directly.
REVOKE ALL ON users, tenants, tenant_memberships, api_keys, documents, chunks FROM anon, authenticated;
