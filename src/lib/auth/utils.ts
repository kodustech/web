import { auth } from "src/core/config/auth";
import { parseJwt } from "src/core/utils/helpers";

export const getJwtPayload = async () => {
    const session = await auth();
    const token = session?.user?.accessToken;
    const parsedToken = parseJwt(token);
    return parsedToken?.payload ? { ...parsedToken.payload, jwt: token } : null;
};
