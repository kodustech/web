import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GitlabProvider from "next-auth/providers/gitlab";
import GoogleProvider from "next-auth/providers/google";
import {
    loginEmailPassword,
    loginOAuth,
    refreshAccessToken,
} from "src/lib/auth/fetchers";
import { AuthProviders } from "src/lib/auth/types";

import { isJwtExpired } from "../utils/helpers";

declare module "next-auth" {
    interface Session {
        user: {
            accessToken: string;
            refreshToken: string;
        } & DefaultSession["user"];
    }
    interface User {
        accessToken: string;
        refreshToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        exp?: number;
    }
}

const credentialsProvider = CredentialsProvider({
    id: AuthProviders.CREDENTIALS,
    name: AuthProviders.CREDENTIALS,
    credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        try {
            const response = await loginEmailPassword({
                email: credentials.email as string,
                password: credentials.password as string,
            });

            if (response && response.data) {
                return { ...response.data.data };
            }

            return null;
        } catch (error: any) {
            console.error(error);
            return null;
        }
    },
});

const githubProvider = GithubProvider({
    id: AuthProviders.GITHUB,
    clientId: process.env.WEB_OAUTH_GITHUB_CLIENT_ID!,
    clientSecret: process.env.WEB_OAUTH_GITHUB_CLIENT_SECRET!,
});

const gitlabProvider = GitlabProvider({
    id: AuthProviders.GITLAB,
    clientId: process.env.WEB_OAUTH_GITLAB_CLIENT_ID!,
    clientSecret: process.env.WEB_OAUTH_GITLAB_CLIENT_SECRET!,
});

const authOptions: NextAuthConfig = {
    providers: [credentialsProvider, githubProvider, gitlabProvider],
    session: {
        strategy: "jwt",
    },
    secret: process.env.WEB_NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in",
        error: "/error",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Deixar o middleware controlar os redirecionamentos
            return url;
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                };
            }

            if (token?.exp && isJwtExpired(token.exp * 1000)) {
                try {
                    const res = await refreshAccessToken({
                        refreshToken: token.refreshToken!,
                    });

                    if (res?.data?.data) {
                        return {
                            ...token,
                            accessToken: res.data.data.accessToken,
                            refreshToken: res.data.data.refreshToken,
                        };
                    }
                } catch (error) {
                    return null;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (!token) {
                return {
                    ...session,
                    user: {
                        ...session.user,
                        accessToken: "",
                        refreshToken: "",
                    },
                };
            }

            return {
                ...session,
                user: {
                    ...session.user,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                },
            };
        },
        async signIn({ account, user }) {
            switch (account?.provider) {
                case AuthProviders.GITHUB:
                case AuthProviders.GITLAB:
                case AuthProviders.GOOGLE:
                    if (!user.name || !user.email || !account.access_token) {
                        return false;
                    }

                    try {
                        const { data: response } = await loginOAuth(
                            user.name,
                            user.email,
                            account.access_token,
                            account.provider as AuthProviders,
                        );

                        if (response && response?.data) {
                            Object.assign(user, {
                                accessToken: response.data.accessToken,
                                refreshToken: response.data.refreshToken,
                            });
                            return true;
                        }
                    } catch (error) {
                        console.error("OAuth login error", error);
                        return false;
                    }

                    return false;
                case AuthProviders.CREDENTIALS:
                    return true;
                default:
                    return false;
            }
        },
        async authorized({ auth }) {
            return !!auth;
        },
    },
    trustHost: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
