import { Page } from "@components/ui/page";

export default function UserLogsLayout({
    children,
}: React.PropsWithChildren) {
    return (
        <Page.Root >
            <Page.Header className="max-w-full">
                <Page.TitleContainer>
                    <Page.Title>User Activity Logs</Page.Title>
                    <Page.Description>
                        Monitor all user activities and configuration changes across your organization.
                    </Page.Description>
                </Page.TitleContainer>
            </Page.Header>
            <Page.Content className="max-w-full">
                {children}
            </Page.Content>
        </Page.Root>
    );
} 