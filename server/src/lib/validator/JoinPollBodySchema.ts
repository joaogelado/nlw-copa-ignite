import { z } from "zod";

export const schema = z.object({
    code: z.string().length(6),
});
