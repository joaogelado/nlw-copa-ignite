import Fastify from "fastify";

import cors from "@fastify/cors";
import env from "@fastify/env";
import jwt from "@fastify/jwt";

import { pollRoutes } from "./routes/poll";
import { gameRoutes } from "./routes/game";
import { guessRoutes } from "./routes/guess";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";

async function main() {
    const instance = Fastify({
        logger: true,
    });

    await instance.register(cors, {
        origin: true,
    });

    await instance.register(env, {
        schema: {
            type: "object",
            required: ["JWT_SIGNATURE"],
            properties: {
                JWT_SIGNATURE: {
                    type: "string",
                },
            },
        },
        dotenv: true,
    });

    await instance.register(jwt, {
        secret: process.env.JWT_SIGNATURE as string,
    });

    await instance.register(pollRoutes);
    await instance.register(guessRoutes);
    await instance.register(gameRoutes);

    await instance.register(userRoutes);
    await instance.register(authRoutes);

    await instance.listen({ port: 3333, host: "0.0.0.0" });
}

main();
