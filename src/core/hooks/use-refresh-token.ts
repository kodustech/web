import { useSession } from "next-auth/react";
import { refreshAccessToken } from "src/lib/auth/fetchers";

export const useRefreshToken = () => {
    const { data, update } = useSession();

    const action = async () => {
        const refreshToken = data?.user.refreshToken;
        const newTokens = await refreshAccessToken({ refreshToken });
        await update(newTokens.data.data);
    };

    return action;
};
