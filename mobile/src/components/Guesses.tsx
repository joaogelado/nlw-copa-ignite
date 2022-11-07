import { Box, FlatList, useToast } from "native-base";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { EmptyMyPollList } from "./EmptyMyPollList";
import { Game, GameProps } from "./Game";
import { Loading } from "./Loading";

interface Props {
    pollId: string;
    code: string;
}

export function Guesses({ pollId, code }: Props) {
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);

    const [games, setGames] = useState<GameProps[]>([]);

    // TODO: Multiple team guesses

    const [firstTeamPoints, setFirstTeamPoints] = useState("");
    const [secondTeamPoints, setSecondTeamPoints] = useState("");

    async function handleConfirmGuess(gameId: string) {
        try {
            setIsLoading(true);

            if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
                toast.show({
                    title: "Informe o placar do palpite.",
                    placement: "top",
                    bgColor: "red.500",
                });

                return;
            }

            await api.post(`/polls/${pollId}/games/${gameId}/guesses`, {
                firstTeamPoints: Number(firstTeamPoints),
                secondTeamPoints: Number(secondTeamPoints),
            });

            toast.show({
                title: "Palpite realizado com sucesso!",
                placement: "top",
                bgColor: "green.500",
            });
        } catch (e) {
            console.error(e);

            toast.show({
                title: "Não foi possivel enviar o palpite.",
                placement: "top",
                bgColor: "red.500",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchGames() {
        try {
            setIsLoading(true);
            const games = await api.get("/polls/" + pollId + "/games");

            setGames(games.data.data);
        } catch (e) {
            console.error(e);

            toast.show({
                title: "Não foi possivel carregar os jogos.",
                placement: "top",
                bgColor: "red.500",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchGames();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                return (
                    <Game
                        data={item}
                        setFirstTeamPoints={setFirstTeamPoints}
                        setSecondTeamPoints={setSecondTeamPoints}
                        onGuessConfirm={() => handleConfirmGuess(item.id)}
                    />
                );
            }}
            _contentContainerStyle={{
                pb: 10,
            }}
            ListEmptyComponent={() => <EmptyMyPollList code={code} />}
        />
    );
}
