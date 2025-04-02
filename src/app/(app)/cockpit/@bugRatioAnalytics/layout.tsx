import { Card } from "@components/ui/card";

export default function Layout({ children }: React.PropsWithChildren) {
    return <Card className="h-full min-h-52">{children}</Card>;
}
