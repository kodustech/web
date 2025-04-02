import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Page } from "@components/ui/page";
import { greeting } from "src/core/utils/helpers";

export default function NotAvailable() {
    return (
        <Page.Root>
            <Page.Header className="max-w-screen-xl">
                <Page.Title>{greeting()}</Page.Title>
            </Page.Header>
            <Page.Content className="max-w-screen-xl">
                <Alert variant="default">
                    <AlertTitle>Analytics Not Available</AlertTitle>
                    <AlertDescription>
                        Analytics features require an Enterprise license or
                        cloud subscription. Contact us to enable these features.
                    </AlertDescription>
                </Alert>
            </Page.Content>
        </Page.Root>
    );
}
