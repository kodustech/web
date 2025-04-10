import { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";

const YouTubeVideoPopup = ({
    videoId,
    title,
}: {
    videoId: string;
    title: string;
}) => {
    const alreadyOpenedOnce = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!alreadyOpenedOnce.current) {
                alreadyOpenedOnce.current = true;
                setIsOpen(true);
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const togglePopup = () => {
        setIsOpen(!isOpen);
        alreadyOpenedOnce.current = true;
    };

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        if (isOpen)
            window.addEventListener("keydown", close, { capture: true });
        return () =>
            window.removeEventListener("keydown", close, { capture: true });
    }, [isOpen]);

    return (
        <div className="fixed bottom-6 left-6">
            {isOpen ? (
                <Card className="bg-card max-w-md overflow-hidden shadow-2xl">
                    <CardHeader className="flex-row gap-6">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-brand-red shrink-0"
                            onClick={togglePopup}>
                            <X />
                        </Button>
                    </CardHeader>
                    <CardContent className="relative pt-[56.25%]">
                        <iframe
                            className="absolute top-0 left-0 h-full w-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen></iframe>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    leftIcon={<HelpCircle />}
                    variant="outline"
                    onClick={togglePopup}>
                    Help
                </Button>
            )}
        </div>
    );
};

export default YouTubeVideoPopup;
