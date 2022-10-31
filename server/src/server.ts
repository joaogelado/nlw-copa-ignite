import Fastify from "fastify";
import { prisma } from "./lib/prisma";

async function main() {
    const server = Fastify({
        logger: true,
    });

    server.get("/polls/count", async (request, reply) => {
        const polls = await prisma.poll.count();

        return { count: polls };
    });

    await server.listen({ port: 3333 });
}

main();
