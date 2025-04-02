enum SenderType {
    SYSTEM = "system",
    USER = "user",
}

export type Conversation = {
    title: string;
    uuid: string;
    type: SenderType;
    messages: Array<{
        type: "human" | "ai";
        data: { content: string };
    }>;
};
