import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { getPollParamsSchema } from "../lib/validator";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(instance: FastifyInstance) {
    instance.get(
        "/polls/:id/games",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const unsafeParams = request.params;

            const safeParams = getPollParamsSchema.parse(unsafeParams);

            const { id } = safeParams;

            const games = await prisma.game.findMany({
                orderBy: {
                    date: "desc",
                },
                include: {
                    guesses: {
                        where: {
                            issuedBy: {
                                user: {
                                    id: request.user.sub,
                                },
                                poll: {
                                    id,
                                },
                            },
                        },
                    },
                },
            });

            return {
                success: true,
                data: {
                    games: games.map((game) => {
                        return {
                            ...game,
                            guess:
                                game.guesses.length > 0
                                    ? game.guesses[0]
                                    : null,
                            guesses: undefined,
                        };
                    }),
                },
            };
        }
    );
}
