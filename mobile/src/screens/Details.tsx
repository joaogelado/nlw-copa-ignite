import { useFocusEffect, useRoute } from "@react-navigation/native";
import { HStack, useToast, VStack } from "native-base";
import { useCallback, useState } from "react";
import { Share } from "react-native";
import { EmptyMyPollList } from "../components/EmptyMyPollList";
import { Guesses } from "../components/Guesses";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { Option } from "../components/Option";
import { PollProps } from "../components/PollCard";
import { PollHeader } from "../components/PollHeader";
import { api } from "../lib/api";

interface RouteParams {
    id: string;
}

export function Details() {
    const route = useRoute();

    const { id } = route.params as RouteParams;

    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [option, setOption] = useState<"myGuesses" | "groupRank">(
        "myGuesses"
    );
    const [pollDetails, setPollDetails] = useState<PollProps>({} as PollProps);

    async function fetchPollDetails() {
        try {
            setIsLoading(true);
            const pollDetails = await api.get("/polls/" + id);

            setPollDetails(pollDetails.data.data);
        } catch (e) {
            console.error(e);

            toast.show({
                title: "Não foi possivel carregar os detalhes do bolão.",
                placement: "top",
                bgColor: "red.500",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchPollDetails();
        }, [id])
    );

    function handleCodeShare() {
        Share.share({
            message: `Quer participar do meu bolão da copa? Então baixe o NLW Copa e coloque esse código: ${pollDetails.code}\n\n :)`,
        });
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <VStack flex={1} bgColor="gray.900">
            <Header
                title={pollDetails.title}
                onShare={handleCodeShare}
                showBackButton
                showShareButton
            />

            {pollDetails._count.participants > 0 ? (
                <VStack px={5} flex={1}>
                    <PollHeader data={pollDetails} />

                    <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
                        <Option
                            title="Seus palpites"
                            isSelected={option === "myGuesses"}
                            onPress={() => setOption("myGuesses")}
                        />
                        <Option
                            title="Ranking do grupo"
                            isSelected={option === "groupRank"}
                            onPress={() => setOption("groupRank")}
                        />
                    </HStack>

                    <Guesses pollId={pollDetails.id} code={pollDetails.code} />
                </VStack>
            ) : (
                <EmptyMyPollList code={pollDetails.code} />
            )}
        </VStack>
    );
}
