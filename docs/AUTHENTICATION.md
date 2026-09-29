# Authentication and authorization

ChatStack uses Supabase Auth for dashboard users. Existing private tenant API keys remain available only for external API integrations.

## Supabase configuration

1. In the Supabase dashboard, open **Authentication → Providers → Email**.
2. Enable email/password authentication.
3. Decide whether email confirmation is required for new accounts.
4. Open **Project Settings → API Keys** and copy the project URL and publishable key.
5. Add the following values to the project-root `.env`:

```dotenv
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is intended for browser use. Never put a Supabase secret or service-role key in a `VITE_` variable.

## Database migration

For an existing ChatStack database, run:

```powershell
npm run migrate:auth
```

Alternatively, paste `backend/db/auth-migration.sql` into the Supabase SQL editor.

The migration links application profiles to `auth.users`, creates `tenant_memberships`, backfills existing tenant owners, and revokes direct browser access to ChatStack tables.

Existing tenants remain attached to the legacy local-development profile. After creating your real account and signing in once, you can transfer those test tenants in the Supabase SQL editor by replacing the email below:

```sql
INSERT INTO tenant_memberships (tenant_id, user_id, role)
SELECT tenants.id, users.id, 'owner'
FROM tenants
CROSS JOIN users
WHERE users.auth_user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL')
ON CONFLICT (tenant_id, user_id) DO NOTHING;
```

Only run this for a trusted owner account. New tenants created from the authenticated dashboard receive the correct owner membership automatically.

## Authorization roles

- `owner`: tenant owner and full access
- `admin`: document management and chat
- `editor`: document upload and chat
- `viewer`: document listing, search, and chat

Tenant creation automatically makes the authenticated user an owner. Every dashboard request is checked against `tenant_memberships` by the Express API.

## API separation

Authenticated dashboard endpoints use Supabase JWTs:

```text
GET  /api/tenants
POST /api/tenants
GET  /api/dashboard/tenants/:tenantId/documents
POST /api/dashboard/tenants/:tenantId/documents
POST /api/dashboard/tenants/:tenantId/search
POST /api/dashboard/tenants/:tenantId/chat
```

External integrations continue using the private tenant key with the original `/api/documents`, `/api/search`, and `/api/chat` endpoints.
