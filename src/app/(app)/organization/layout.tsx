import { PropsWithChildren } from "react";
import { Page } from "@components/ui/page";

import { ConfigsSidebar } from "./_components/sidebar";

export default async function Layout(props: PropsWithChildren) {
    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <ConfigsSidebar />
            <Page.WithSidebar>{props.children}</Page.WithSidebar>
        </div>
    );
}
