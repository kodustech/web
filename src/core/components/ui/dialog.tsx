"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "src/core/utils/components";

import { useMagicModalState } from "./magic-modal";

const Dialog = (
    props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
) => {
    const { closeable } = useMagicModalState();

    return (
        <DialogPrimitive.Root
            {...props}
            onOpenChange={(open) => {
                if (!closeable) return;
                props.onOpenChange?.(open);
            }}
        />
    );
};

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => <DialogPrimitive.Close asChild ref={ref} {...props} />);
DialogClose.displayName = DialogPrimitive.Close.displayName;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-xs",
            className,
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
    const { closeable } = useMagicModalState();

    return (
        <DialogPortal>
            <DialogOverlay />

            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-80 data-[state=open]:zoom-in-80 fixed top-[50%] left-[50%] z-50 flex max-h-[calc(100%-(--spacing(16)))] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col gap-4 border p-6 shadow-lg duration-200 sm:rounded-2xl md:w-full",
                    className,
                )}
                {...props}>
                {children}

                {closeable && (
                    <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
                        <X className="size-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "mb-4 flex flex-col justify-center gap-y-2 text-center sm:text-left",
            className,
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("mt-4 flex flex-row justify-end gap-x-2", className)}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "text-lg leading-none font-semibold tracking-tight",
            className,
        )}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
