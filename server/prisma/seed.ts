import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
    const userEmail = `jhondoe${randomBytes(4).toString("hex")}@example.com`;
    const userEmail2 = `jhondoe2${randomBytes(4).toString("hex")}@example.com`;

    const user = await prisma.user.create({
        data: {
            name: "Jhon Doe",
            email: userEmail,
            avatarUrl: "https://github.com/joaogelado.png",
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Jhon Doe 2",
            email: userEmail2,
            avatarUrl: "https://github.com/joaogelado.png",
        },
    });

    const poll = await prisma.poll.create({
        data: {
            title: "Bolão do Jhon Doe",
            code: "BOL123",
            createdBy: {
                connect: {
                    id: user.id,
                },
            },

            participants: {
                create: [
                    {
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                    {
                        user: {
                            connect: {
                                id: user2.id,
                            },
                        },
                    },
                ],
            },
        },
    });

    await prisma.game.create({
        data: {
            date: "2022-11-06T12:00:00.367Z",
            firstTeamCountryCode: "BR",
            secondTeamCountryCode: "AR",

            guesses: {
                create: {
                    issuedBy: {
                        connect: {
                            userId_pollId: { userId: user.id, pollId: poll.id },
                        },
                    },
                    firstTeamGuessedPoints: 0,
                    secondTeamGuessedPoints: 2,
                },
            },
        },
    });

    await prisma.game.create({
        data: {
            date: "2022-11-06T16:00:00.367Z",
            firstTeamCountryCode: "JP",
            secondTeamCountryCode: "BR",

            guesses: {
                create: {
                    issuedBy: {
                        connect: {
                            userId_pollId: {
                                userId: user.id,
                                pollId: poll.id,
                            },
                        },
                    },
                    firstTeamGuessedPoints: 1,
                    secondTeamGuessedPoints: 7,
                },
            },
        },
    });
}

main();
