import React from "react";
import { Heading } from "@components/ui/heading";

const textTopObject = {
    codeManagement: {
        title: "Source code management",
        subTitle: "(Choose one)",
    },
    projectManagement: {
        title: "Project management",
        subTitle: "(Optional)",
    },
    communication: { title: "Communication", subTitle: "(Optional)" },
};

const TextTopIntegrations = ({
    serviceType,
}: {
    serviceType: "codeManagement" | "communication" | "projectManagement";
}): React.ReactNode => {
    const textObject = textTopObject[serviceType];
    return (
        <div className="mb-4 flex flex-col">
            <Heading variant="h2">{textObject.title}</Heading>
            <span className="text-xs text-muted-foreground">
                {textObject.subTitle}
            </span>
        </div>
    );
};

export default TextTopIntegrations;
