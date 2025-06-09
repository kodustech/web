import { headers } from "next/headers";

export const CURRENT_PATH_HEADER = "x-current-path";

// depends on middleware: https://github.com/vercel/next.js/issues/43704#issuecomment-1411186664
export const getCurrentPathnameOnServerComponents = async () =>
    (await headers()).get(CURRENT_PATH_HEADER);
