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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useAsyncAction } from "@hooks/use-async-action";
import { AxiosError } from "axios";

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
                    <DialogTitle>New Integration</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="token">
                    <TabsList>
                        <TabsTrigger value="token">App Password</TabsTrigger>
                    </TabsList>

                    <TabsContent value="token">
                        <FormControl.Root>
                            <FormControl.Input>
                                <Input
                                    type="text"
                                    value={username}
                                    error={error.message}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Bitbucket Username"
                                />

                                <Input
                                    type="password"
                                    value={token}
                                    error={error.message}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Bitbucket App Password"
                                />

                                <FormControl.Error>
                                    {error.message}
                                </FormControl.Error>
                            </FormControl.Input>
                        </FormControl.Root>

                        <DialogFooter>
                            <Button
                                size="md"
                                variant="primary"
                                onClick={saveToken}
                                loading={loadingSaveToken}
                                disabled={
                                    !username || !token || !!error.message
                                }>
                                Save Token
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
