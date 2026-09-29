import { useMutation } from "@tanstack/react-query";
import { askQuestion } from "../api/chat.api";
export function useChat(tenantId: string) { return useMutation({ mutationFn: (question: string) => askQuestion(tenantId, question) }); }
