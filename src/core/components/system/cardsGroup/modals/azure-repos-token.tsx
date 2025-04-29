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
    onSave: (token: string, organizationName: string) => Promise<void>;
};

export const AzureReposModal = (props: Props) => {
    const [organizationName, setOrganizationName] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState({ message: "" });

    useEffect(() => {
        setError({ message: "" });
    }, [token, organizationName]);

    const [saveToken, { loading: loadingSaveToken }] = useAsyncAction(
        async () => {
            magicModal.lock();

            try {
                await props.onSave(token, organizationName);
                magicModal.hide();
            } catch (error) {
                magicModal.unlock();

                if (error instanceof AxiosError && error.status === 400) {
                    setError({ message: "Invalid organization name or token" });
                }
            }
        },
    );

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span>Azure Repos</span> - New Integration
                    </DialogTitle>
                </DialogHeader>

                <FormControl.Root>
                    <FormControl.Label htmlFor="azure-repos-username-input">
                        Organization name
                    </FormControl.Label>

                    <FormControl.Input>
                        <Input
                            type="text"
                            value={organizationName}
                            error={error.message}
                            id="azure-repos-username-input"
                            onChange={(e) =>
                                setOrganizationName(e.target.value)
                            }
                            placeholder="Paste your organization name"
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <FormControl.Root>
                    <FormControl.Label htmlFor="azure-repos-token-input">
                        Personal Access Token
                    </FormControl.Label>
                    <FormControl.Input>
                        <Input
                            type="password"
                            value={token}
                            error={error.message}
                            id="azure-repos-token-input"
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your Personal Access Token"
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
                        disabled={
                            !organizationName || !token || !!error.message
                        }>
                        Save Token
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
