import { forwardRef } from "react";

import { Button } from "./button";

export const Badge = forwardRef<
    HTMLButtonElement,
    Partial<Omit<React.ComponentProps<typeof Button>, "decorative">>
>((props, ref) => {
    return (
        <Button
            ref={ref}
            size="xs"
            variant="primary-dark"
            {...props}
            decorative
        />
    );
});
