import { createContext, ReactNode, useEffect, useState } from "react";

import { useAuthRequest } from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { api } from "../lib/api";

maybeCompleteAuthSession();

interface UserProps {
    name: string;
    avatarUrl: string;
}

export interface AuthContextDataProps {
    user: UserProps;
    isUserLoading: boolean;
    signIn: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>({} as UserProps);
    const [isUserLoading, setIsUserLoading] = useState(false);

    const [req, res, promptAsync] = useAuthRequest({
        clientId: process.env.GOOGLE_API_CLIENT_ID,
        scopes: ["profile", "email"],
        redirectUri: makeRedirectUri({ useProxy: true }),
    });

    async function signIn() {
        try {
            setIsUserLoading(true);
            await promptAsync();
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsUserLoading(false);
        }
    }

    async function signInWithGoogle(access_token: string) {
        try {
            setIsUserLoading(true);

            const response = await api.post("/auth", { access_token });

            api.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.data.token}`;

            setUser(response.data.data.user);
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setIsUserLoading(false);
        }
    }

    useEffect(() => {
        if (res?.type === "success" && res.authentication?.accessToken) {
            signInWithGoogle(res.authentication.accessToken);
        }
    }, [res]);

    return (
        <AuthContext.Provider
            value={{
                signIn,
                isUserLoading,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
