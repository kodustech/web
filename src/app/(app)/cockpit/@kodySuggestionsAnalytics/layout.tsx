import { Card, CardHeader, CardTitle } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm">Kody Suggestions</CardTitle>
            </CardHeader>

            {children}
        </Card>
    );
}
