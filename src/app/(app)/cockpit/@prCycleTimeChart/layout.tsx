import { Card, CardHeader, CardTitle } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <Card className="h-full min-h-[450px]">
            <CardHeader>
                <CardTitle className="text-sm">PR Cycle Time</CardTitle>
            </CardHeader>

            {children}
        </Card>
    );
}
