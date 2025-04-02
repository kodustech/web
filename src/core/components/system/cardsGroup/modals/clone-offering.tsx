import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { Copy, Plus } from "lucide-react";

export const CloneOfferingModal = () => {
    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Integration</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span>
                        Choose between cloning an existing integration or 
                        creating a new one, tailored to your needs.
                    </span>

                    <span>
                        <strong className="text-foreground">
                            Clone Integration:
                        </strong>{" "}
                        When you choose to clone, the tool's authentication 
                        settings will automatically be copied to the selected 
                        team. This allows you to replicate an already configured 
                        integration in a quick and straightforward way.
                    </span>

                    <span>
                        <strong className="text-foreground">
                            New Integration:
                        </strong>{" "}
                        If you prefer a new integration, an independent instance 
                        of the tool will be created, allowing you to fully customize 
                        the settings according to your specific requirements.
                    </span>

                    <span>Select one of the options below to proceed:</span>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        leftIcon={<Copy />}
                        onClick={() => magicModal.hide("clone")}>
                        Clone Integration
                    </Button>

                    <Button
                        onClick={() => magicModal.hide("new")}
                        leftIcon={<Plus />}>
                        New Integration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
