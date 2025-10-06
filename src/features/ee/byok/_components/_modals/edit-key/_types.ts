import { z } from "zod";

export const editKeySchema = z.object({
    provider: z.string().trim().min(1),
    model: z.string().trim().min(1),
    apiKey: z.string().trim().min(1),
    baseURL: z.url().nullable().optional(),
});

export type EditKeyForm = z.infer<typeof editKeySchema>;
