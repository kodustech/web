export type CLIKey = {
    uuid: string;
    name: string;
    active: boolean;
    lastUsedAt?: string | null;
    createdAt: string;
    createdBy: {
        uuid: string;
        name: string;
        email: string;
    };
};

export type CreateCLIKeyResponse = {
    key: string;
    message?: string;
};
