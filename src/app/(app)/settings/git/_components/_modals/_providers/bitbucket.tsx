"use client";

import { useEffect, useState } from "react";
import { GitTokenDocs } from "@components/system/git-token-docs";
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
import { useAsyncAction } from "@hooks/use-async-action";
import { AxiosError } from "axios";
import { Save } from "lucide-react";

type Props = {
    onSave: (token: string, username: string) => Promise<void>;
};

export const BitbucketModal = (props: Props) => {
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState({ message: "" });

    useEffect(() => {
        setError({ message: "" });
    }, [token, username]);

    const [saveToken, { loading: loadingSaveToken }] = useAsyncAction(
        async () => {
            magicModal.lock();

            try {
                await props.onSave(token, username);
                magicModal.hide();
            } catch (error) {
                magicModal.unlock();

                if (error instanceof AxiosError && error.status === 400) {
                    setError({ message: "Invalid Token or Username" });
                }
            }
        },
    );

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span>Bitbucket</span> - New Integration
                    </DialogTitle>
                </DialogHeader>

                <FormControl.Root>
                    <FormControl.Label htmlFor="bitbucket-username-input">
                        Username
                    </FormControl.Label>

                    <FormControl.Input>
                        <Input
                            type="text"
                            value={username}
                            error={error.message}
                            id="bitbucket-username-input"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Paste your username"
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <FormControl.Root>
                    <FormControl.Label htmlFor="bitbucket-app-password-input">
                        App password
                    </FormControl.Label>
                    <FormControl.Input>
                        <Input
                            type="password"
                            value={token}
                            error={error.message}
                            id="bitbucket-app-password-input"
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your app password"
                        />
                    </FormControl.Input>

                    <FormControl.Error>{error.message}</FormControl.Error>
                </FormControl.Root>

                <GitTokenDocs provider="bitbucket" />

                <DialogFooter>
                    <Button
                        size="md"
                        variant="primary"
                        onClick={saveToken}
                        leftIcon={<Save />}
                        loading={loadingSaveToken}
                        disabled={!username || !token || !!error.message}>
                        Validate and save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
