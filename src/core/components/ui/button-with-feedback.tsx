import { Children, isValidElement, useMemo, useState } from "react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";

const ButtonWithFeedback = ({
    onHideFeedback,
    delay = 1500,
    ...props
}: React.ComponentProps<typeof Button> & {
    onHideFeedback?: () => void;
    delay?: number;
}) => {
    const [isShowingFeedback, setIsShowingFeedback] = useState(false);

    const { Feedback, Content } = useMemo(() => {
        let Feedback: React.ReactNode = null;
        let Content: React.ReactNode = null;

        Children.forEach(props.children, (c) => {
            if (!isValidElement(c) || typeof c.type === "string") return c;

            switch ((c.type as any).displayName) {
                case "ButtonWithFeedbackContent": {
                    Content = c;
                    break;
                }

                case "ButtonWithFeedbackFeedback": {
                    Feedback = c;
                    break;
                }
            }
        });

        return { Feedback, Content };
    }, [props.children]);

    return (
        <Button
            {...props}
            disabled={isShowingFeedback}
            className={cn(
                props.className,
                isShowingFeedback && "pointer-events-none",
            )}
            onClick={(ev) => {
                setIsShowingFeedback(true);
                props.onClick?.(ev);

                setTimeout(() => {
                    setIsShowingFeedback(false);
                    onHideFeedback?.();
                }, delay);
            }}>
            {isShowingFeedback ? Feedback : Content}
        </Button>
    );
};

const ButtonWithFeedbackContent = ({ children }: React.PropsWithChildren) =>
    children;
ButtonWithFeedbackContent.displayName = "ButtonWithFeedbackContent";
ButtonWithFeedback.Content = ButtonWithFeedbackContent;

const ButtonWithFeedbackFeedback = ({ children }: React.PropsWithChildren) =>
    children;
ButtonWithFeedbackFeedback.displayName = "ButtonWithFeedbackFeedback";
ButtonWithFeedback.Feedback = ButtonWithFeedbackFeedback;

export { ButtonWithFeedback };
