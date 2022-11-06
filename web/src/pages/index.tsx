import Image from "next/image";

import appPreview from "../assets/app-preview.png";
import logo from "../assets/logo.svg";
import defaultAvatars from "../assets/default-avatars.png";
import check from "../assets/check.svg";
import { GetStaticProps } from "next";
import { api } from "../lib/api";
import { FormEvent, useState } from "react";
import { Loading } from "../components/Loading";

interface HomeProps {
    pollCount: number;
    userCount: number;
    guessCount: number;
}

export default function Home({ pollCount, userCount, guessCount }: HomeProps) {
    const [pollTitle, setPollTitle] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleCreatePoll(event: FormEvent) {
        event.preventDefault();

        try {
            if (!pollTitle) {
                return alert("Por favor, preencha o título do bolão.");
            }

            setLoading(true);

            const response = await api.post("/polls", {
                title: pollTitle,
            });

            const responseCode = response.data.data.code;

            await navigator.clipboard.writeText(responseCode);

            alert(
                "Bolão criado com sucesso! Código copiado para a área de transferência."
            );

            setLoading(false);

            setPollTitle("");
        } catch (error) {
            console.error(error);
            alert("Falha ao criar bolão");
        }
    }

    return (
        <div className="bg-web-bg bg-cover bg-no-repeat">
            <div className="max-w-6xl mx-auto h-screen grid gap-28 grid-cols-2 items-center">
                <main>
                    <Image src={logo} alt="Logo da NLW Copa" />
                    <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
                        Crie seu próprio bolão da copa e compartilhe entre
                        amigos!
                    </h1>
                    <div className="mt-10 flex items-center gap-2">
                        <Image
                            src={defaultAvatars}
                            alt="Imagem de pessoas que usam o NLW Copa"
                        />
                        <strong className="text-gray-100 text-xl">
                            <span className="text-ignite-500">
                                +{userCount}
                            </span>{" "}
                            pessoas já estão usando
                        </strong>
                    </div>
                    <form
                        className="mt-10 flex gap-2"
                        onSubmit={handleCreatePoll}
                    >
                        <input
                            className="outline-none flex-1 px-6 py-4 rounded bg-gray-800 text-sm border border-gray-600 text-gray-100"
                            type="text"
                            required
                            onChange={(event) =>
                                setPollTitle(event.target.value)
                            }
                            value={pollTitle}
                            placeholder="Qual nome do seu bolão?"
                        />
                        <button
                            type="submit"
                            className={`bg-yellow-500 hover:bg-yellow-700 duration-300 transition-colors ease-in-out px-6 py-4 rounded font-bold text-gray-900 text-sm uppercase ${
                                loading
                                    ? "cursor-not-allowed bg-yellow-700"
                                    : ""
                            }`}
                            disabled={loading}
                        >
                            {loading ? <Loading /> : "Criar meu bolão"}
                        </button>
                    </form>
                    <p className="leading-relaxed mt-4 text-sm text-gray-300">
                        {" "}
                        Após criar seu bolão, você receberá um código único que
                        poderá usar para convidar outras pessoas 🚀{" "}
                    </p>
                    <div className="text-gray-100 mt-10 pt-10 border-t items-center border-gray-600 flex justify-between">
                        <div className="flex items-center gap-6">
                            <Image src={check} alt="" />
                            <div className="flex flex-col">
                                <span className="font-bold text-2xl">
                                    +{pollCount}
                                </span>
                                <span>Bolões criados</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-gray-600" />
                        <div className="flex items-center gap-6">
                            <Image src={check} alt="" />
                            <div className="flex flex-col">
                                <span className="font-bold text-2xl">
                                    +{guessCount}
                                </span>
                                <span>Palpites enviados</span>
                            </div>
                        </div>
                    </div>
                </main>
                <Image
                    src={appPreview}
                    alt="Dois celulares mostrando a aplicação do Nlw Copa"
                />
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const [pollCountResponse, userCountResponse, guessCountResponse] =
        await Promise.all([
            api.get("/polls"),
            api.get("/users"),
            api.get("/guesses"),
        ]);

    return {
        props: {
            pollCount: pollCountResponse.data.count,
            userCount: userCountResponse.data.count,
            guessCount: guessCountResponse.data.count,
        },
        revalidate: 30,
    };
};
