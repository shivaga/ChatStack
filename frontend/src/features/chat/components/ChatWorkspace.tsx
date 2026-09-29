import { useState, type FormEvent } from "react";
import { useChat } from "../hooks/use-chat";
import type { ChatMessage } from "../types/chat";

type Props = { isOpen: boolean; tenantId: string; tenantName?: string; onClose: () => void };
export function ChatWorkspace({ isOpen, tenantId, tenantName, onClose }: Props) {
  const chatMutation = useChat(tenantId);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !tenantId || chatMutation.isPending) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: trimmedQuestion }]);
    setQuestion(""); setError(null);
    try {
      const response = await chatMutation.mutateAsync(trimmedQuestion);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: response.answer, sources: response.sources }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not get an answer.");
    }
  }

  if (!isOpen) return null;
  return <aside className="chat-drawer" aria-label="Tenant knowledge chat">
    <div className="chat-drawer-header"><div><span className="overline">Tenant knowledge</span><h2>Ask {tenantName ?? "ChatStack"}</h2><p>Answers use ready documents and include their sources.</p></div><button className="chat-close" type="button" onClick={onClose} aria-label="Close chat">×</button></div>
    <div className="chat-history" aria-live="polite">{messages.length === 0 ? <div className="chat-empty"><strong>Start with a question</strong><span>Try asking for a summary, policy detail, or a comparison across documents.</span></div> : messages.map((message) => <article className={`message message-${message.role}`} key={message.id}><strong>{message.role === "user" ? "You" : "ChatStack"}</strong><p>{message.content}</p>{message.sources && message.sources.length > 0 && <details><summary>Sources used ({message.sources.length})</summary>{message.sources.map((source, index) => <div className="source" key={`${source.document}-${index}`}><strong>{source.document}</strong><small>{(source.score * 100).toFixed(1)}% match</small><p>{source.excerpt}</p></div>)}</details>}</article>)}</div>
    <form className="chat-composer" onSubmit={submit}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={`Ask about ${tenantName ?? "this tenant"}…`} disabled={!tenantId || chatMutation.isPending} maxLength={8000} required /><div className="composer-footer"><span>Answers include citations</span><button type="submit" disabled={!tenantId || !question.trim() || chatMutation.isPending}>{chatMutation.isPending ? "…" : "↑"}</button></div></form>
    {error && <p className="chat-error" role="alert">{error}</p>}
  </aside>;
}
