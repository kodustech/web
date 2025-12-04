"use server";

import { MetadataReader } from "passport-saml-metadata";

export async function fetchAndParseMetadata(url: string) {
    if (!url) throw new Error("URL is required");

    try {
        const parsedUrl = new URL(url);
        if (!["http", "https"].includes(parsedUrl.protocol)) {
            throw new Error("URL must use http or https protocol");
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const rawMetadata = await response.text();

        const metadata = new MetadataReader(rawMetadata);

        return {
            idpIssuer: metadata.entityId,
            entryPoint: metadata.identityProviderUrl,
            cert: metadata.signingCert,
            identifierFormat: metadata.identifierFormat,
            success: true,
        };
    } catch (error) {
        console.error("Metadata fetch error:", error);
        return { success: false, error: "Failed to parse metadata" };
    }
}
