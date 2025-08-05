import type React from "react";
import { MagicModalPortal } from "@components/ui/magic-modal";

export default function Layout(props: React.PropsWithChildren) {
    return (
        <>
            {props.children}
            <MagicModalPortal />
        </>
    );
}
