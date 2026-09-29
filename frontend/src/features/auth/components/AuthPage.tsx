import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsSubmitting(true); setError(null); setNotice(null);
    try {
      if (mode === "signin") await signIn(email, password);
      else if (!await signUp(email, password, displayName)) setNotice("Check your email to confirm the account, then sign in.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Authentication failed."); }
    finally { setIsSubmitting(false); }
  }

  return <main className="auth-page"><section className="auth-story"><span className="auth-brand">ChatStack</span><div><span className="overline">Knowledge, in context</span><h1>Answers your team can defend.</h1><p>Build isolated tenant knowledge bases from the documents your customers and teams already trust.</p></div><small>Gemini-grounded answers · PostgreSQL vector search · tenant isolation</small></section><section className="auth-form-panel"><div className="auth-form-wrap"><span className="overline">{mode === "signin" ? "Welcome back" : "Create your account"}</span><h2>{mode === "signin" ? "Sign in to ChatStack" : "Start your workspace"}</h2><p>{mode === "signin" ? "Access the tenants you belong to." : "Your first tenant can be created after account confirmation."}</p><form className="auth-form" onSubmit={submit}>{mode === "signup" && <label>Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required /></label><button className="primary-button" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form>{error && <p className="error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}<button className="auth-switch" type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}>{mode === "signin" ? "New to ChatStack? Create an account" : "Already have an account? Sign in"}</button></div></section></main>;
}
