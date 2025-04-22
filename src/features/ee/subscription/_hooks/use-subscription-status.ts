"use client";

import { differenceInDays } from "date-fns";

import { useSubscriptionContext } from "../_providers/subscription-context";

// Definição dos tipos de licença
type License =
    | {
          valid: false;
          subscriptionStatus: "payment_failed" | "canceled" | "expired";
          numberOfLicenses: number;
      }
    | {
          valid: true;
          subscriptionStatus: "trial";
          trialEnd: string;
      }
    | {
          valid: true;
          subscriptionStatus: "active";
          numberOfLicenses: number;
      };

type TrialSubscriptionStatus = {
    status: "trial-active" | "trial-expiring";
    valid: true;
    trialEnd: string;
    trialDaysLeft: number;
};

type InvalidSubscriptionStatus = {
    valid: false;
    numberOfLicenses: number;
    usersWithAssignedLicense: { git_id: string }[];
    status: "payment-failed" | "canceled" | "expired";
};

type ActiveSubscriptionStatus = {
    valid: true;
    status: "active";
    numberOfLicenses: number;
    usersWithAssignedLicense: { git_id: string }[];
};

type SelfHostedSubscriptionStatus = {
    valid: true;
    status: "self-hosted";
};

type SubscriptionStatus =
    | ActiveSubscriptionStatus
    | TrialSubscriptionStatus
    | InvalidSubscriptionStatus
    | SelfHostedSubscriptionStatus;

export const useSubscriptionStatus = (): SubscriptionStatus => {
    const subscription = useSubscriptionContext();
    const license = subscription.license as License;

    if (license.valid) {
        if (subscription.license.subscriptionStatus === "self-hosted") {
            return {
                valid: true,
                status: "self-hosted",
            };
        }

        // Active subscription
        if (license.subscriptionStatus === "active") {
            return {
                valid: true,
                status: "active",
                numberOfLicenses: license.numberOfLicenses,
                usersWithAssignedLicense: subscription.usersWithAssignedLicense,
            };
        }

        // Trial
        if (license.subscriptionStatus === "trial") {
            const daysLeft = differenceInDays(license.trialEnd, new Date());

            if (
                // If the trial is not expired, but expiring in 3 days or less
                differenceInDays(new Date(), license.trialEnd) >= -3
            ) {
                return {
                    valid: true,
                    trialEnd: license.trialEnd,
                    trialDaysLeft: daysLeft,
                    status: "trial-expiring",
                };
            }

            return {
                valid: true,
                trialEnd: license.trialEnd,
                trialDaysLeft: daysLeft,
                status: "trial-active",
            };
        }
    }

    // Caso inválido
    return {
        valid: false,
        numberOfLicenses: (license as any).numberOfLicenses || 0,
        status:
            license.subscriptionStatus === "payment_failed"
                ? "payment-failed"
                : license.subscriptionStatus,
        usersWithAssignedLicense: subscription.usersWithAssignedLicense,
    };
};
