import { Card, CardHeader, CardTitle } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <Card className="h-full min-h-[450px]">
            <CardHeader>
                <CardTitle className="text-sm">
                    PRs Merged By Developer
                </CardTitle>
            </CardHeader>

            {children}
        </Card>
    );
}
