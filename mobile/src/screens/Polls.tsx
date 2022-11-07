import { FlatList, Icon, useToast, VStack } from "native-base";
import { Button } from "../components/Button";
import { Header } from "../components/Header";

import { Octicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { api } from "../lib/api";
import { useCallback, useState } from "react";
import { PollCard, PollProps } from "../components/PollCard";
import { EmptyPollList } from "../components/EmptyPollList";
import { Loading } from "../components/Loading";

export function Polls() {
    const navigation = useNavigation();
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [polls, setPolls] = useState<PollProps[]>([]);

    async function fetchPolls() {
        try {
            setIsLoading(true);
            const pollsRes = await api.get("/polls");

            setPolls(pollsRes.data.data.polls);
        } catch (e) {
            console.error(e);

            toast.show({
                title: "Não foi possivel carregar os bolões.",
                placement: "top",
                bgColor: "red.500",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchPolls();
        }, [])
    );

    return (
        <VStack flex={1} bgColor="gray.900">
            <Header title="Meus bolões" />
            <VStack
                mt={6}
                mx={5}
                borderBottomWidth={1}
                borderBottomColor="gray.600"
                pb={4}
                mb={4}
            >
                <Button
                    leftIcon={
                        <Icon
                            as={Octicons}
                            name="search"
                            color="black"
                            size="md"
                        />
                    }
                    title="Buscar bolão por código"
                    onPress={() => navigation.navigate("find")}
                />
            </VStack>

            {isLoading ? (
                <Loading />
            ) : (
                <FlatList
                    data={polls}
                    px={5}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{
                        pb: 10,
                    }}
                    ListEmptyComponent={() => <EmptyPollList />}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }: { item: PollProps }) => (
                        <PollCard
                            data={item}
                            onPress={() =>
                                navigation.navigate("details", {
                                    id: item.id,
                                })
                            }
                        />
                    )}
                />
            )}
        </VStack>
    );
}
