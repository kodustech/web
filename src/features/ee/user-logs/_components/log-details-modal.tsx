"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import { Separator } from "@components/ui/separator";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { UserLog } from "@services/userLogs/types";

interface LogDetailsModalProps {
    log: UserLog;
    children: React.ReactNode;
}

export const LogDetailsModal = ({ log, children }: LogDetailsModalProps) => {
    const [open, setOpen] = useState(false);

    const getActionColor = (action: string) => {
        switch (action) {
            case "add":
            case "create":
                return "bg-success/10 text-success ring-success/64 [--button-foreground:var(--color-success)]";
            case "edit":
                return "bg-info/10 text-info ring-info/64 [--button-foreground:var(--color-info)]";
            case "delete":
                return "bg-danger/10 text-danger ring-danger/64 [--button-foreground:var(--color-danger)]";
            case "clone":
                return "bg-warning/10 text-warning ring-warning/64 [--button-foreground:var(--color-warning)]";
            default:
                return "bg-alert/10 text-alert ring-alert/64 [--button-foreground:var(--color-alert)]";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Badge
                            className={` h-6 min-h-auto rounded-lg px-2 text-[10px] leading-px uppercase ring-1 ${getActionColor(log._action)}`}>
                            {log._action}
                        </Badge>
                        Log Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold mb-4 mt-5">Basic Information</h4>
                        <div className="space-y-2 text-sm flex flex-col gap-2">
                            <div className="flex justify-between border-b-1 border-b-card-lv2 pb-2">
                                <span className="text-muted-foreground font-semibold">User</span>
                                <span className="font-medium">{log._userInfo.userEmail}</span>
                            </div>
                            <div className="flex justify-between border-b-1 border-b-card-lv2 pb-2 align-middle">
                                <span className="text-muted-foreground font-semibold">Level</span>
                                <Badge variant="helper" className="capitalize">
                                    {log._configLevel}
                                </Badge>
                            </div>
                            <div className="flex justify-between border-b-1 border-b-card-lv2 pb-2">
                                <span className="text-muted-foreground font-semibold">Created</span>
                                <span>{format(new Date(log._createdAt), "PPP 'at' p", { locale: enUS })}</span>
                            </div>
                            <div className="flex justify-between border-b-1 border-b-card-lv2 pb-2">
                                <span className="text-muted-foreground font-semibold">Updated</span>
                                <span>{format(new Date(log._updatedAt), "PPP 'at' p", { locale: enUS })}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-3">Changes</h4>
                        <div className="space-y-4">
                            {log._changedData.map((change, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex helper-center gap-2">
                                        <Badge variant="helper">
                                            {change.actionDescription}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground font-semibold mb-2">Description</p>
                                        <p className="text-sm">{change.description}</p>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="helper" size="md" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 