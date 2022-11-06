import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function userRoutes(instance: FastifyInstance) {
    instance.get("/users", async (request, reply) => {
        const usersCount = await prisma.user.count();

        return { count: usersCount };
    });

    instance.get(
        "/me",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            await request.jwtVerify();

            return {
                user: request.user,
            };
        }
    );
}
