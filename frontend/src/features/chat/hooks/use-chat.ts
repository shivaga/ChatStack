import { useMutation } from "@tanstack/react-query";
import { askQuestion } from "../api/chat.api";
export function useChat(apiKey: string) { return useMutation({ mutationFn: (question: string) => askQuestion(apiKey, question) }); }
