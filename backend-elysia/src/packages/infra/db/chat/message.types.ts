export interface ToolInvocation {
  toolCallId: string;
  toolName: "execute_sql";
  args: { query: string; rationale: string };
  result: { rows: unknown[]; fields: unknown[]; rowCount: number };
  state: "partial-call" | "call" | "result";
}

export interface AiSdkMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}
