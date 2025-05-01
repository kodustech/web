import * as React from "react";
import { Heart } from "lucide-react";
import { Button } from "./button";
import { cn } from "src/core/utils/components";

interface LikeButtonProps {
    likes: number;
    isLiked: boolean;
    onLike: () => void;
    className?: string;
}

export const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(
    ({ likes, isLiked, onLike, className }, ref) => {
        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onLike();
        };

        return (
            <Button
                ref={ref}
                variant="helper"
                size="sm"
                leftIcon={
                    <Heart
                        className={cn(
                            "transition-colors",
                            isLiked && "fill-brand-red text-brand-red"
                        )}
                    />
                }
                onClick={handleClick}
                className={className}>
                {likes}
            </Button>
        );
    }
);

LikeButton.displayName = "LikeButton"; 