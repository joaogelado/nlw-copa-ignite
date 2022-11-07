import { Heading, useToast, VStack } from "native-base";
import { Header } from "../components/Header";

import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useState } from "react";
import { api } from "../lib/api";
import { AxiosError } from "axios";
import { useNavigation } from "@react-navigation/native";

export function Find() {
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState("");

    const { navigate } = useNavigation();

    async function handleJoinPoll() {
        try {
            setIsLoading(true);

            if (!code.trim()) {
                toast.show({
                    title: "Informe o código.",
                    placement: "top",
                    bgColor: "red.500",
                });
            }

            await api.put("/polls", {
                code,
            });

            toast.show({
                title: "Você entrou no bolão com sucesso!",
                placement: "top",
                bgColor: "red.500",
            });

            setIsLoading(false);

            navigate("polls");
        } catch (e) {
            console.error(e);
            setIsLoading(false);

            if (e instanceof AxiosError) {
                if (
                    e.response?.data?.errorObject.code ===
                    "POLL_ROUTES:JOIN_POLL:NOT_FOUND"
                ) {
                    toast.show({
                        title: "Bolão não encontrado.",
                        placement: "top",
                        bgColor: "red.500",
                    });
                } else if (
                    e.response?.data?.errorObject.code ===
                    "POLL_ROUTES:JOIN_POLL:ALREADY_JOINED"
                ) {
                    toast.show({
                        title: "Você já está participando deste bolão.",
                        placement: "top",
                        bgColor: "red.500",
                    });
                } else {
                    toast.show({
                        title: "Não foi possivel entrar no bolão.",
                        placement: "top",
                        bgColor: "red.500",
                    });
                }
            }
        }
    }
    return (
        <VStack flex={1} bgColor="gray.900">
            <Header title="Buscar por código" showBackButton />

            <VStack mt={8} mx={5} alignItems="center">
                <Heading
                    fontFamily="heading"
                    color="white"
                    fontSize="xl"
                    mb={8}
                    textAlign="center"
                >
                    Encontre um bolão através de seu código único
                </Heading>

                <Input
                    onChangeText={(e) => setCode(e.toUpperCase())}
                    value={code}
                    mb={2}
                    placeholder="Qual o código do bolão?"
                />

                <Button title="Buscar bolão" />
            </VStack>
        </VStack>
    );
}
