import { TenantDashboardPage } from "../pages/TenantDashboardPage";
import { AuthPage } from "../features/auth/components/AuthPage";
import { useAuth } from "../features/auth/context/AuthContext";
export function App() { const { user, isLoading } = useAuth(); if (isLoading) return <div className="app-loading">Loading ChatStack…</div>; return user ? <TenantDashboardPage /> : <AuthPage />; }
