import { Heading } from "@components/ui/heading";
import { Icons } from "@components/ui/icons";
import { Page } from "@components/ui/page";

export default function GeneratingConfig() {
    return (
        <Page.Root>
            <Page.Content>
                <div className="flex h-full w-full flex-col items-center justify-center gap-5">
                    <Heading variant="h2">
                        Generating code review parameters
                    </Heading>
                    <p>Come back in a few minutes...</p>
                    <Icons.spinner className="animate-spin" />
                </div>
            </Page.Content>
        </Page.Root>
    );
}
