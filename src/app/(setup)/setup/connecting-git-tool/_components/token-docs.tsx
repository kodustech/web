import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@components/ui/accordion";
import { Link } from "@components/ui/link";
import { HelpCircle, ShieldAlert } from "lucide-react";

export const TokenDocs = (props: { link: string }) => {
    return (
        <div className="flex flex-col gap-6">
            <Accordion type="single" collapsible>
                <AccordionItem value="fgpat" className="border-b">
                    <AccordionTrigger value="fgpat">
                        <div className="flex flex-row items-center gap-3">
                            <ShieldAlert className="text-muted-foreground" />

                            <p className="text-xs">
                                Why do we use a Fine-Grained Personal Access
                                Token (FGPAT)?
                            </p>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-3 text-xs text-muted-foreground">
                        <p>
                            Even with the Kodus app installed in your
                            organization, we use an FGPAT to ensure:
                        </p>

                        <ul className="children:flex children:gap-1 children:border-b children:py-2 last:children:border-b-0">
                            <li>
                                <strong className="text-foreground">
                                    Security:
                                </strong>
                                Access only to the necessary parts of the
                                repository
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Precise Permissions:
                                </strong>
                                <span>
                                    Exact control over what Kody can do.
                                </span>
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Ease of Management:
                                </strong>
                                <span>
                                    Simple adjustment or revocation of
                                    permissions
                                </span>
                            </li>
                        </ul>

                        <p>
                            The FGPAT keeps your repository secure and under
                            control while Kodus automates code reviews.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex flex-row items-center gap-3 text-xs">
                <HelpCircle className="text-muted-foreground" />

                <p className="flex flex-col gap-1">
                    <span>Questions about configuring the access token?</span>
                    <Link
                        href={props.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs">
                        Check our documentation
                    </Link>
                </p>
            </div>
        </div>
    );
};
