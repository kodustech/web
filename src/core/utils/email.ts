// https://github.com/tompec/public-email-providers-domains
import emailDomains from "./email_domains.json";

export const publicDomainsSet = new Set(
    emailDomains.flatMap((d) => d.domains.map((domain) => domain.domain)),
);
