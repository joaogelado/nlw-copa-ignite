import { z } from "zod";

export const schema = z.object({
    access_token: z.string().length(212),
});
