import z from "zod";

export const editKeySchema = z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string().trim().min(1),
    baseURL: z.string().url().nullable().optional(),
});

export type EditKeyForm = z.infer<typeof editKeySchema>;
