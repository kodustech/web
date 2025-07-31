export default function Layout({ children }: React.PropsWithChildren) {
    return <div className="grid h-full grid-cols-5 gap-2">{children}</div>;
}
