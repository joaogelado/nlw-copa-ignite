import { z } from "zod";

export const schema = z.object({
    pollId: z.string().cuid(),
    gameId: z.string().cuid(),
});
