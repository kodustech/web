"use server";

import type { Route } from "next";
import { revalidatePath, revalidateTag } from "next/cache";

export const revalidateServerSidePath = async (
    path: Route,
    type?: "layout" | "page",
) => {
    revalidatePath(path, type);
};

export const revalidateServerSideTag = async (tag: string) => {
    revalidateTag(tag);
};
