import { Card } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return <Card className="h-full">{children}</Card>;
}
