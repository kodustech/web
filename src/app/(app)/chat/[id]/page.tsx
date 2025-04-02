import { cookies } from "next/headers";

import { PageComponent } from "./page-component";

export default async function Chat(props: { params: Promise<{ id: string }> }) {
    const [params, appCookies] = await Promise.all([props.params, cookies()]);
    const firstMessage = appCookies.get(
        `new-chat-first-message/${params.id}`,
    )?.value;

    return <PageComponent chatId={params.id} firstMessage={firstMessage} />;
}
