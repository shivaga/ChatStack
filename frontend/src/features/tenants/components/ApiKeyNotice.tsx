import { useState } from "react";
type Props = { apiKey: string; onDismiss: () => void };
export function ApiKeyNotice({ apiKey, onDismiss }: Props) { const [copied, setCopied] = useState(false); async function copyKey() { await navigator.clipboard.writeText(apiKey); setCopied(true); } return <div className="key-card" role="status"><strong>Copy this API key now — it will not be shown again.</strong><code>{apiKey}</code><button type="button" onClick={copyKey}>{copied ? "Copied" : "Copy key"}</button><button type="button" className="text" onClick={onDismiss}>I've saved it</button></div>; }
