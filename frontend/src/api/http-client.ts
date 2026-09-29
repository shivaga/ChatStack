const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
type ApiErrorPayload = { error?: string };
export class ApiError extends Error { constructor(message: string, public readonly status: number) { super(message); this.name = "ApiError"; } }
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const payload = (await response.json().catch(() => null)) as T | ApiErrorPayload | null;
  if (!response.ok) { const message = payload && typeof payload === "object" && "error" in payload ? payload.error ?? "The request failed." : "The request failed."; throw new ApiError(message, response.status); }
  return payload as T;
}

export async function authenticatedApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError("Sign in to continue.", 401);
  return apiRequest<T>(path, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } });
}
import { supabase } from "./supabase-client";
