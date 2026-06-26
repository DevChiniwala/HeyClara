import type { z } from "zod";

export interface NiaTool {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: (args: Record<string, unknown>, ctx?: Record<string, unknown>) => Promise<string> | string;
}
