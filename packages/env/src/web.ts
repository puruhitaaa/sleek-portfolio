import { z } from "zod";

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_RESUME_URL: z.string().url().optional(),
});

export const webEnv = webEnvSchema.parse(process.env);

export type WebEnv = z.infer<typeof webEnvSchema>;
