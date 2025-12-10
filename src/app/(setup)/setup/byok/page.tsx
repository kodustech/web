import { redirect } from "next/navigation";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { SetupByokPage } from "./page.client";

export default function ByokStep() {
    if (!isSelfHosted) {
        redirect("/setup/review-mode");
    }

    return <SetupByokPage />;
}
