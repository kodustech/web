export type OrganizationLicenseInvalid = {
    valid: false;
    subscriptionStatus: "payment_failed" | "canceled" | "expired" | "inactive";
    numberOfLicenses: number;
};

export type OrganizationLicenseTrial = {
    valid: true;
    subscriptionStatus: "trial";
    trialEnd: string;
};

export type OrganizationLicenseActive = {
    valid: true;
    subscriptionStatus: "active";
    numberOfLicenses: number;
};

export type OrganizationLicenseSelfHosted = {
    valid: true;
    subscriptionStatus: "self-hosted";
};

export type OrganizationLicense =
    | OrganizationLicenseInvalid
    | OrganizationLicenseTrial
    | OrganizationLicenseActive
    | OrganizationLicenseSelfHosted;
