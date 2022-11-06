import { z } from "zod";

export const schema = z.object({
    firstTeamPoints: z.number(),
    secondTeamPoints: z.number(),
});
