"use client";

import { useEffect, useState } from "react";
import { GitTokenDocs } from "@components/system/git-token-docs";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useAsyncAction } from "@hooks/use-async-action";
import { AxiosError } from "axios";
import { Info, Save } from "lucide-react";

type Props = {
    onGoToOauth: () => void;
    onSaveToken: (token: string) => Promise<void>;
};

export const GithubModal = (props: Props) => {
    const [token, setToken] = useState("");
    const [error, setError] = useState({ message: "" });

    useEffect(() => {
        setError({ message: "" });
    }, [token]);

    const [saveToken, { loading: loadingSaveToken }] = useAsyncAction(
        async () => {
            magicModal.lock();

            try {
                await props.onSaveToken(token);
                magicModal.hide();
            } catch (error) {
                magicModal.unlock();

                if (error instanceof AxiosError && error.status === 400) {
                    setError({ message: "Invalid Token" });
                }
            }
        },
    );

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span className="capitalize">Github</span> - New
                        Integration
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="oauth">
                    <TabsList>
                        <TabsTrigger value="oauth">OAuth</TabsTrigger>
                        <TabsTrigger value="token">Token</TabsTrigger>
                    </TabsList>

                    <TabsContent value="oauth">
                        <DialogFooter>
                            <Button
                                size="md"
                                variant="primary"
                                onClick={props.onGoToOauth}>
                                Go to OAuth
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="token">
                        <Alert variant="info" className="mb-4">
                            <Info />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                Unlike OAuth, reviews will be published using
                                your profile - not Kody's.
                            </AlertDescription>
                        </Alert>

                        <FormControl.Root>
                            <FormControl.Input>
                                <Input
                                    type="password"
                                    value={token}
                                    error={error.message}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Personal Access Token"
                                />

                                <FormControl.Error>
                                    {error.message}
                                </FormControl.Error>
                            </FormControl.Input>
                        </FormControl.Root>

                        <GitTokenDocs provider="github" />

                        <DialogFooter>
                            <Button
                                size="md"
                                variant="primary"
                                onClick={saveToken}
                                leftIcon={<Save />}
                                loading={loadingSaveToken}
                                disabled={!token || !!error.message}>
                                Validate and save
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
