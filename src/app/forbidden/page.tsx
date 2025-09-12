"use client";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { ArrowLeft } from "lucide-react";

export default function GlobalForbidden() {
    return (
        <Page.Root className="flex h-full w-full flex-col items-center justify-center overflow-auto">
            <Card
                color="lv1"
                className="flex w-md flex-col items-center justify-center gap-10 p-10">
                <Page.Header className="flex w-full flex-col items-center gap-8">
                    <SvgKodus className="h-8" />

                    <div className="flex flex-col items-center gap-2">
                        <Heading variant="h2" className="text-center">
                            Access Denied
                        </Heading>

                        <div className="text-text-secondary text-center text-sm">
                            <p>You do not have access to this resource</p>
                        </div>
                    </div>
                </Page.Header>

                <div className="flex gap-4">
                    <Button
                        size="sm"
                        variant="cancel"
                        leftIcon={<ArrowLeft />}
                        onClick={() => window.history.back()}>
                        Go back
                    </Button>

                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                            window.location.href = "/";
                        }}>
                        Go to start page
                    </Button>
                </div>
            </Card>
        </Page.Root>
    );
}
