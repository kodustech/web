"use client";

import { use } from "react";
import { DataTable } from "@components/ui/data-table";
import { Input } from "@components/ui/input";
import { Page } from "@components/ui/page";
import { SearchIcon } from "lucide-react";

import { columns } from "./_components/columns";
import { IssuesListContext } from "./_contexts/issues-list";

export default function IssuesPage() {
    const issues = use(IssuesListContext);

    return (
        <Page.Root>
            <Page.Header className="max-w-full">
                <Page.Title>
                    Issues{" "}
                    <small className="text-text-secondary">
                        ({issues.length})
                    </small>
                </Page.Title>

                <Page.HeaderActions>
                    <Input
                        className="w-60"
                        placeholder="Search for issue"
                        leftIcon={<SearchIcon />}
                        // onChange={(e) => setQuery(e.target.value)}
                    />
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="max-w-full">
                <DataTable data={issues} columns={columns} />
            </Page.Content>
        </Page.Root>
    );
}
