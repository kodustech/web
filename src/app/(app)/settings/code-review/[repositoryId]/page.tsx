import { redirect } from "next/navigation";

export default async function CodeReviewPage({
    params,
}: {
    params: Promise<{ repositoryId: string }>;
}) {
    const { repositoryId } = await params;
    redirect(`/settings/code-review/${repositoryId}/general`);
}
