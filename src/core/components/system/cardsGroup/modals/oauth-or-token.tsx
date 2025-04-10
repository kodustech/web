import { useEffect, useState } from "react";
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
import type { INTEGRATIONS_KEY } from "@enums";
import { useAsyncAction } from "@hooks/use-async-action";
import { AxiosError } from "axios";
import { Info } from "lucide-react";

type Props = {
    integration: INTEGRATIONS_KEY;
    onGoToOauth: () => Promise<void>;
    onSaveToken: (token: string) => Promise<void>;
};

export const OauthOrTokenModal = (props: Props) => {
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

    const [goToOAuth, { loading: loadingGoToOauth }] = useAsyncAction(
        props.onGoToOauth,
    );

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Integration</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="oauth">
                    <TabsList>
                        <TabsTrigger value="oauth">OAuth</TabsTrigger>
                        <TabsTrigger value="token">Token</TabsTrigger>
                    </TabsList>

                    <TabsContent value="oauth">
                        <DialogFooter>
                            <Button
                                loading={loadingGoToOauth}
                                onClick={goToOAuth}>
                                Go to OAuth
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="token">
                        <Alert className="my-4 border-ring/50 text-ring dark:border-ring [&>svg]:text-ring">
                            <Info size={18} />
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

                        <DialogFooter className="mb-6">
                            <Button
                                onClick={saveToken}
                                loading={loadingSaveToken}
                                disabled={!token || !!error.message}>
                                Save Token
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
