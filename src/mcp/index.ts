export interface McpSourceContext {
  jobName?: string;
  channel?: string;
  room?: string;
  slackChannelId?: string;
  slackThreadTs?: string;
}

let _mcpFactory: ((ctx?: McpSourceContext) => Record<string, unknown>) | null = null;

export function setMcpFactory(factory: (ctx?: McpSourceContext) => Record<string, unknown>): void {
  _mcpFactory = factory;
}

export function getMcpServers(ctx?: McpSourceContext): Record<string, unknown> | undefined {
  return _mcpFactory?.(ctx) ?? undefined;
}
