import { z } from "zod";

export const schema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    picture: z.string().url(),
});
