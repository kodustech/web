import { PropsWithChildren } from "react";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";

import { ConfigsSidebar } from "./_components/sidebar";

export default async function Layout(props: PropsWithChildren) {
    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <ConfigsSidebar />
            <Separator orientation="vertical" />
            <Page.WithSidebar>{props.children}</Page.WithSidebar>
        </div>
    );
}
