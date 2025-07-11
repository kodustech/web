"use client";

import { useRouter } from "next/navigation";
import { toast } from "@components/ui/toaster/use-toast";
import { useEffectOnce } from "@hooks/use-effect-once";
import { XCircleIcon } from "lucide-react";

export default function ErrorComponent() {
    const router = useRouter();

    useEffectOnce(() => {
        toast({
            variant: "warning",
            title: "Please try again",
            description: "You will be redirected back to plugins page",
        });

        const timeout = setTimeout(() => {
            router.replace("/settings/plugins");
        }, 3000);

        return () => {
            clearTimeout(timeout);
        };
    });

    return <XCircleIcon className="text-danger size-10" />;
}
