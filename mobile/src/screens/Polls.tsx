import { FlatList, Icon, useToast, VStack } from "native-base";
import { Button } from "../components/Button";
import { Header } from "../components/Header";

import { Octicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../lib/api";
import { useState } from "react";
import { PoolCard, PoolPros } from "../components/PoolCard";

export function Polls() {
    const navigation = useNavigation();
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [polls, setPolls] = useState<PoolPros[]>([])

    async function fetchPolls() {
        try {
            setIsLoading(true)
            const pollsRes = await api.get("/polls")

            setPolls(pollsRes)
        } catch (e) {
            console.error(e)

            toast.show({
                title: "Não foi possivel carregar os bolões.",
                placement: "top",
                bgColor: "red.500"
            })
        } finally {
            setIsLoading(false)
        }
    }

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

            <FlatList data={polls} px={5} showsVerticalScrollIndicator={false} _contentContainerStyl={{}}  keyExtractor={item => item.id} renderItems={({ item }) => <PoolCard data={item} />} />
        </VStack>
    );
}
