import { Card, CardHeader } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <div className="grid h-full grid-cols-5 gap-2">
            <Card className="col-span-2 bg-transparent shadow-none">
                <CardHeader className="text-text-secondary text-sm">
                    The card(s) displays the number of Suggestions Provided by
                    Kody for each active Analysis Types. The data is filtered
                    based on the number of suggestions sent to the team within
                    the chosen time period.
                </CardHeader>
            </Card>

            {children}
        </div>
    );
}
