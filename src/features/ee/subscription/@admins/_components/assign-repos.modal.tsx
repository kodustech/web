import { SelectRepositories } from "@components/system/select-repositories";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { MagicModalContext } from "@components/ui/magic-modal";

export default function AssignReposModal() {
    return (
        <MagicModalContext value={{ closeable }}>
            <Dialog
                open
                onOpenChange={() => {
                    router.push("/settings/git");
                }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {props.platformName} repositories setup
                        </DialogTitle>

                        <DialogDescription>
                            Select the repositories you want to use Kody
                        </DialogDescription>
                    </DialogHeader>

                    <FormControl.Root className="w-full">
                        <FormControl.Input>
                            <SelectRepositories
                                open={open}
                                teamId={teamId}
                                onOpenChange={setOpen}
                                selectedRepositories={selectedRepositories}
                                onFinishLoading={() =>
                                    setIsLoadingRepositories(false)
                                }
                                onChangeSelectedRepositories={
                                    setSelectedRepositories
                                }
                            />
                        </FormControl.Input>
                    </FormControl.Root>

                    <DialogFooter>
                        {closeable && (
                            <DialogClose>
                                <Button size="md" variant="cancel">
                                    Cancel
                                </Button>
                            </DialogClose>
                        )}

                        <Button
                            size="md"
                            variant="primary"
                            loading={loadingSaveRepositories}
                            onClick={saveSelectedRepositoriesAction}
                            disabled={
                                selectedRepositories.length === 0 ||
                                isLoadingRepositories
                            }>
                            Edit repositories
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
}
