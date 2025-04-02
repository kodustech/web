import { Card, CardHeader, CardTitle } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <Card className="h-full min-h-64">
            <CardHeader>
                <CardTitle className="text-sm">
                    Repositories Code Health Summary
                </CardTitle>
            </CardHeader>

            {children}
        </Card>
    );
}
