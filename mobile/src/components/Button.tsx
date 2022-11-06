import { Button as NativeBaseButton, IButtonProps, Text } from "native-base";

interface ButtonProps extends IButtonProps {
    title: string;
    type?: "primary" | "secondary";
}

export function Button({ title, type = "primary", ...rest }: ButtonProps) {
    return (
        <NativeBaseButton
            w="full"
            h={14}
            rounded="sm"
            fontSize="md"
            textTransform="uppercase"
            bg={type === "secondary" ? "red.500" : "yellow.500"}
            _pressed={{ bg: type === "secondary" ? "red.600" : "yellow.600" }}
            _loading={{
                _spinner: {
                    color: "white",
                },
            }}
            {...rest}
        >
            <Text
                textTransform="uppercase"
                fontSize="sm"
                fontFamily="heading"
                color={type === "secondary" ? "white" : "black"}
            >
                {title}
            </Text>
        </NativeBaseButton>
    );
}
