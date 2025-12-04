"use server";

import { MetadataReader } from "passport-saml-metadata";

export async function fetchAndParseMetadata(url: string) {
    if (!url) throw new Error("URL is required");

    try {
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
