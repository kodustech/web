"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function OptinMonsterRouteChangeListener() {
    const pathname = usePathname();
    const [_changes, setChanges] = useState(0);

    useEffect(() => {
        // @ts-ignore
        if (window.om360754_340940) window.om360754_340940.reset();
        setChanges((prev) => prev + 1);
    }, [pathname]);

    return null;
}
