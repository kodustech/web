"use client";

import { ExternalReferencesDisplay } from "./external-references-display";

const exampleExternalReferences = {
    references: [
        {
            filePath: "README.md",
            repositoryName: "task-api-example",
        }
    ],
    syncErrors: [],
    processingStatus: "completed" as const,
};

const exampleWithErrors = {
    references: [
        {
            filePath: "docs/api.md",
            repositoryName: "my-project",
        },
        {
            filePath: "CONTRIBUTING.md",
            repositoryName: "my-project",
        }
    ],
    syncErrors: [
        "Failed to fetch content from repository 'old-repo'",
        "File 'docs/old-guide.md' was deleted"
    ],
    processingStatus: "failed" as const,
};

const exampleProcessing = {
    references: [],
    syncErrors: [],
    processingStatus: "processing" as const,
};

export function ExternalReferencesTestPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-4">External References Display Examples</h1>
                
                <div className="space-y-6 max-w-md">
                    <div>
                        <h2 className="text-sm font-semibold mb-2">Completed with 1 reference</h2>
                        <ExternalReferencesDisplay 
                            externalReferences={exampleExternalReferences}
                        />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-2">Failed with 2 references and errors</h2>
                        <ExternalReferencesDisplay 
                            externalReferences={exampleWithErrors}
                        />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-2">Processing status</h2>
                        <ExternalReferencesDisplay 
                            externalReferences={exampleProcessing}
                        />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-2">No references (hidden)</h2>
                        <ExternalReferencesDisplay 
                            externalReferences={undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
