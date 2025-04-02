export type Chat = {
    id: string;
    title: string;

    context: {
        conversation: string;
        teamId: string;
    };
};
