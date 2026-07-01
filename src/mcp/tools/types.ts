import type { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerArgs = any;

export interface ClaraTool {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: (args: HandlerArgs, ctx?: Record<string, unknown>) => Promise<string> | string;
}


