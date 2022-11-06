import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import {
    createNewGuessBodySchema,
    createNewGuessParamsSchema,
} from "../lib/validator";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(instance: FastifyInstance) {
    instance.get("/guesses", async (request, reply) => {
        const guessesCount = await prisma.guess.count();

        return { count: guessesCount };
    });

    instance.post(
        "/polls/:pollId/games/:gameId/guesses",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const unsafeParams = request.params;

            const safeParams = createNewGuessParamsSchema.parse(unsafeParams);

            const { pollId, gameId } = safeParams;

            const unsafeBody = request.body;

            const safeBody = createNewGuessBodySchema.parse(unsafeBody);

            const { firstTeamPoints, secondTeamPoints } = safeBody;

            const participant = await prisma.participant.findUnique({
                where: {
                    userId_pollId: {
                        userId: request.user.sub,
                        pollId,
                    },
                },
            });

            if (!participant) {
                reply.code(404);

                return {
                    success: false,
                    errorObject: {
                        code: "GUESS_ROUTES:CREATE_GUESS:POLL_NOT_FOUND",
                    },
                };
            }

            const guess = await prisma.guess.findUnique({
                where: {
                    gameId_participantId: {
                        gameId,
                        participantId: participant.id,
                    },
                },
            });

            if (guess) {
                reply.code(422);

                return {
                    success: false,
                    errorObject: {
                        code: "GUESS_ROUTES:CREATE_GUESS:GUESS_ALREADY_EXISTS",
                    },
                };
            }

            const game = await prisma.game.findUnique({
                where: {
                    id: gameId,
                },
            });

            if (!game) {
                reply.code(404);

                return {
                    success: false,
                    errorObject: {
                        code: "GUESS_ROUTES:CREATE_GUESS:GAME_NOT_FOUND",
                    },
                };
            }

            if (game.date < new Date()) {
                reply.code(422);

                return {
                    success: false,
                    errorObject: {
                        code: "GUESS_ROUTES:CREATE_GUESS:GAME_ALREADY_STARTED",
                    },
                };
            }

            await prisma.guess.create({
                data: {
                    firstTeamGuessedPoints: firstTeamPoints,
                    secondTeamGuessedPoints: secondTeamPoints,
                    issuedBy: {
                        connect: {
                            id: request.user.sub,
                        },
                    },
                    game: {
                        connect: {
                            id: gameId,
                        },
                    },
                },
            });

            reply.code(201);

            return { success: true };
        }
    );
}
