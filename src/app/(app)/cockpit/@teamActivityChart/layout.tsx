import { Card, CardHeader, CardTitle } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Team Activity</CardTitle>
            </CardHeader>

            {children}
        </Card>
    );
}
