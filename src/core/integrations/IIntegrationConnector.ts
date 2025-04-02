export interface IIntegrationConnector {
    connect: (
        hasConnection: boolean,
        routerConfig: {
            push: (route: string) => void;
            pathname: string;
        },
        routerPath?: string,
        url?: string,
    ) => Promise<void>;
}
