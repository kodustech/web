"use server";

import { cookies } from "next/headers";

export const transferChatFirstMessage = async (
    text: string,
    chatId: string,
) => {
    const appCookies = await cookies();
    appCookies.set(`new-chat-first-message/${chatId}`, text, {
        httpOnly: true,
        secure: true,
    });
};
