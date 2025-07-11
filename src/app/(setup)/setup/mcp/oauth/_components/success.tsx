"use client";

import { useRouter } from "next/navigation";
import { useEffectOnce } from "@hooks/use-effect-once";
import { CheckCircle2Icon } from "lucide-react";

export default function SuccessComponent() {
    const router = useRouter();

    useEffectOnce(() => {
        const timeout = setTimeout(() => {
            router.replace("/settings/plugins");
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    });

    return <CheckCircle2Icon className="text-success size-10" />;
}
