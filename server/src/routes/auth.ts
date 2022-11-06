import fastify, { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticateUserBodySchema } from "../lib/validator";
import { googleUserInfoResponseSchema } from "../lib/validator/external";

export async function authRoutes(instance: FastifyInstance) {
    instance.post("/auth", async (request, reply) => {
        const unsafeBody = request.body;

        const safeBody = authenticateUserBodySchema.parse(unsafeBody);

        const { access_token } = safeBody;

        const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const unsafeUserData = await userResponse.json();

        const safeUserData = googleUserInfoResponseSchema.parse(unsafeUserData);

        const { email, name, picture, id } = safeUserData;

        let user = await prisma.user.findUnique({
            where: {
                googleId: id,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    avatarUrl: picture,
                    googleId: id,
                },
            });
        }

        const token = instance.jwt.sign(
            {
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
            {
                sub: user.id,
                expiresIn: "1d",
            }
        );

        return {
            success: true,
            data: {
                email,
                name,
                picture,
                id,
                token,
            },
        };
    });
}
