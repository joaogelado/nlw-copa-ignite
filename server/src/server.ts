import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";

async function main() {
    const server = Fastify({
        logger: true,
    });

    await server.register(cors, {
        origin: true,
    });

    server.get("/polls/count", async (request, reply) => {
        const polls = await prisma.poll.count();

        return { count: polls };
    });

    await server.listen({ port: 3333, host: "0.0.0.0" });
}

main();
