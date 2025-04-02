"use server";

import { cookies } from "next/headers";

export const deleteChatFirstMessage = async (chatId: string) => {
    const appCookies = await cookies();
    appCookies.delete({
        name: `new-chat-first-message/${chatId}`,
        httpOnly: true,
        secure: true,
    });
};
