import { Spinner } from "./spinner";

export const GenericLoading = () => (
    <div className="flex h-full w-full items-center justify-center gap-4">
        <Spinner />
        <p className="text-sm">Doing some magic...</p>
    </div>
);
