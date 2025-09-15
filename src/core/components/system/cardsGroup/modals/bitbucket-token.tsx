import { useEffect, useState } from "react";
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

type Props = {
    onSave: (token: string, username: string, email: string) => Promise<void>;
};

export const BitbucketModal = (props: Props) => {
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState({ message: "" });

    useEffect(() => {
        setError({ message: "" });
    }, [token, username, email]);

    const [saveToken, { loading: loadingSaveToken }] = useAsyncAction(
        async () => {
            magicModal.lock();

            try {
                await props.onSave(token, username, email);
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
                    <FormControl.Label htmlFor="bitbucket-email-input">
                        Email
                    </FormControl.Label>
                    <FormControl.Input>
                        <Input
                            type="email"
                            value={email}
                            error={error.message}
                            id="bitbucket-email-input"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <FormControl.Root>
                    <FormControl.Label htmlFor="bitbucket-api-token-input">
                        API token
                    </FormControl.Label>
                    <FormControl.Input>
                        <Input
                            type="password"
                            value={token}
                            error={error.message}
                            id="bitbucket-api-token-input"
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your API token"
                        />
                    </FormControl.Input>

                    <FormControl.Error>{error.message}</FormControl.Error>
                </FormControl.Root>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="primary"
                        onClick={saveToken}
                        loading={loadingSaveToken}
                        disabled={!username || !token || !email || !!error.message}>
                        Save Token
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
