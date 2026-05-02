import { z } from 'zod';

/**
 * Q10 Layer 1 LOCK — request body shape 만. form state와 분리 (UI 상태 ≠ API contract).
 */
export const ExtractArticleRequestSchema = z.object({
  url: z.string().url(),
});

export type ExtractArticleRequest = z.infer<typeof ExtractArticleRequestSchema>;
