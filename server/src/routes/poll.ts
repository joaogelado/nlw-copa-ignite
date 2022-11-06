import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { createErrorMessage } from "../lib/errorBuilder";
import { prisma } from "../lib/prisma";
import {
    createNewPollBodySchema,
    getPollParamsSchema,
    joinPollBodySchema,
} from "../lib/validator";
import { authenticate } from "../plugins/authenticate";

export async function pollRoutes(instance: FastifyInstance) {
    instance.get("/polls", async (request, reply) => {
        const pollCount = await prisma.poll.count();
        try {
            request.jwtVerify();

            try {
                const polls = await prisma.poll.findMany({
                    where: {
                        participants: {
                            some: {
                                user: {
                                    id: request.user.sub,
                                },
                            },
                        },
                    },
                    include: {
                        _count: {
                            select: {
                                participants: true,
                            },
                        },
                        participants: {
                            take: 4,
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                        createdBy: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                });

                reply.send(polls);

                return {
                    success: true,
                    data: {
                        count: pollCount,
                        participatingPolls: polls,
                    },
                };
            } catch (error) {
                console.error(error);

                reply.code(500);

                return {
                    success: false,
                    errorObject: error,
                };
            }
        } catch {
            return { count: pollCount };
        }
    });

    instance.post("/polls", async (request, reply) => {
        try {
            // Treat the request body as a CreateNewPollBodySchema
            const unsafeBody = request.body;

            const safeBody = createNewPollBodySchema.parse(unsafeBody);

            const { title } = safeBody;

            // Create a new poll in the database

            /// Create Short UID for the code of the poll
            const suid = new ShortUniqueId({
                length: 6,
                dictionary: "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
            }).randomUUID();

            /// Create the poll in the database

            let newPoll;

            //// Check if user is authenticated
            try {
                await request.jwtVerify();
                ///// User is authenticated. Create the poll with the user as the owner

                newPoll = await prisma.poll.create({
                    data: {
                        title,
                        code: suid,
                        createdBy: {
                            connect: {
                                id: request.user.sub,
                            },
                        },

                        participants: {
                            create: {
                                user: {
                                    connect: {
                                        id: request.user.sub,
                                    },
                                },
                            },
                        },
                    },
                });
            } catch {
                newPoll = await prisma.poll.create({
                    data: {
                        title,
                        code: suid,
                    },
                });
            }

            // Return the new poll
            reply.code(201);

            return {
                success: true,
                data: {
                    id: newPoll.id,
                    title: newPoll.title,
                    code: newPoll.code,
                },
            };
        } catch (error: any) {
            const { errorMetadata, errorObject } = createErrorMessage(
                error,
                "poll routes:create new poll"
            );

            reply.code(errorMetadata.statusCode);

            return { success: false, error: errorObject };
        }
    });

    instance.put(
        "/polls",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            try {
                const unsafeBody = request.body;

                const safeBody = joinPollBodySchema.parse(unsafeBody);

                const { code } = safeBody;

                const poll = await prisma.poll.findUnique({
                    where: {
                        code,
                    },
                    include: {
                        participants: {
                            where: {
                                user: {
                                    id: request.user.sub,
                                },
                            },
                        },
                    },
                });

                if (!poll) {
                    reply.code(404);
                    return {
                        success: false,
                        error: {
                            code: "POLL_ROUTES:JOIN_POLL:NOT_FOUND",
                        },
                    };
                }

                if (poll.participants.length > 0) {
                    reply.code(400);
                    return {
                        success: false,
                        error: {
                            code: "POLL_ROUTES:JOIN_POLL:ALREADY_JOINED",
                        },
                    };
                }

                if (!poll.createdByUserId) {
                    await prisma.poll.update({
                        where: {
                            id: poll.id,
                        },
                        data: {
                            createdBy: {
                                connect: {
                                    id: request.user.sub,
                                },
                            },
                        },
                    });
                }

                await prisma.participant.create({
                    data: {
                        poll: {
                            connect: {
                                id: poll.id,
                            },
                        },
                        user: {
                            connect: {
                                id: request.user.sub,
                            },
                        },
                    },
                });

                reply.code(201);

                return {
                    success: true,
                };
            } catch (error: any) {
                const { errorMetadata, errorObject } = createErrorMessage(
                    error,
                    "poll routes:join poll"
                );

                reply.code(errorMetadata.statusCode);

                return { success: false, error: errorObject };
            }
        }
    );

    instance.get(
        "/polls/:id",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const unsafeParams = request.params;

            const safeParams = getPollParamsSchema.parse(unsafeParams);

            const { id } = safeParams;

            const poll = await prisma.poll.findUnique({
                where: {
                    id,
                },
                include: {
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                    participants: {
                        take: 4,
                        select: {
                            id: true,
                            user: {
                                select: {
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    createdBy: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            });

            return {
                success: true,
                data: poll,
            };
        }
    );
}
