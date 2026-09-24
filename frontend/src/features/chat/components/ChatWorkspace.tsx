import { useState, type FormEvent } from "react";
import { useChat } from "../hooks/use-chat";
import type { ChatMessage } from "../types/chat";

type Props = { enabled: boolean; apiKey: string; tenantName?: string };
export function ChatWorkspace({ enabled, apiKey, tenantName }: Props) {
  const chatMutation = useChat(apiKey);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !enabled || chatMutation.isPending) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmedQuestion };
    setMessages((current) => [...current, userMessage]);
    setQuestion(""); setError(null);
    try {
      const response = await chatMutation.mutateAsync(trimmedQuestion);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: response.answer, sources: response.sources }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not get an answer.");
    }
  }

  return <section className="panel chat-panel">
    <div className="section-title"><div><h2>Knowledge chat</h2><p>{tenantName ? `Ask questions using the ready documents for ${tenantName}.` : "Select a tenant and provide its private API key above to chat."}</p></div>{messages.length > 0 && <button type="button" className="text" onClick={() => setMessages([])}>Clear chat</button>}</div>
    <div className="chat-history" aria-live="polite">{messages.length === 0 ? <div className="empty">Your answers will include the relevant source document excerpts.</div> : messages.map((message) => <article className={`message message-${message.role}`} key={message.id}><strong>{message.role === "user" ? "You" : "ChatStack"}</strong><p>{message.content}</p>{message.sources && message.sources.length > 0 && <details><summary>Sources used ({message.sources.length})</summary>{message.sources.map((source, index) => <div className="source" key={`${source.document}-${index}`}><strong>{source.document}</strong><small>Match: {(source.score * 100).toFixed(1)}%</small><p>{source.excerpt}</p></div>)}</details>}</article>)}</div>
    <form className="chat-form" onSubmit={submit}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={enabled ? "Ask a question about this tenant’s documents..." : "Select a tenant and paste its API key first"} disabled={!enabled || chatMutation.isPending} maxLength={8000} required /><button type="submit" disabled={!enabled || !question.trim() || chatMutation.isPending}>{chatMutation.isPending ? "Thinking..." : "Ask"}</button></form>
    {error && <p className="error" role="alert">{error}</p>}
  </section>;
}
