"use client";

import {
    AlertCircleIcon,
    AlertTriangleIcon,
    CheckCircle2Icon,
    InfoIcon,
    XOctagonIcon,
} from "lucide-react";

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

const icons = {
    success: <CheckCircle2Icon className="text-success" />,
    info: <InfoIcon className="text-info" />,
    alert: <AlertTriangleIcon className="text-alert" />,
    warning: <AlertCircleIcon className="text-warning" />,
    danger: <XOctagonIcon className="text-danger" />,
} satisfies Record<
    NonNullable<React.ComponentProps<typeof Toast>["variant"]>,
    React.ReactNode
>;

export function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider swipeDirection="up">
            {toasts.map(function ({
                id,
                title,
                description,
                variant,
                ...props
            }) {
                return (
                    <Toast key={id} {...props} variant={variant}>
                        <div className="flex gap-x-4">
                            <span className="*:size-7">{icons[variant]}</span>

                            <div className="flex min-h-7 flex-col justify-center gap-y-1">
                                {title && <ToastTitle>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription>
                                        {description}
                                    </ToastDescription>
                                )}
                            </div>
                        </div>

                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
