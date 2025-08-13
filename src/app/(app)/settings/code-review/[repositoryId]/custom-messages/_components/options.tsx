"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import { cn } from "src/core/utils/components";

/* Match @variable-name, @variable_name, @variableName */
export const VARIABLE_REGEX = /\@((?:\w(?:[-_]?))+)/g;

export const DEFAULT_START_REVIEW_MESSAGE = `# PR Summary (Comment created by [Kody](https://kodus.io) 🤖)

## Code Review Started! 🚀

✋ Hi, team! I'm already looking at the changed files and starting the review to ensure everything is in order. If you need more details, I'm here! [Kody](https://kodus.io)

@changedFiles

@changeSummary`;

export const DEFAULT_END_REVIEW_MESSAGE = `## Code Review Completed! 🔥

The code review was successfully completed based on your current configurations.



<details>
<summary>Kody Guide: Usage and Configuration</summary>

<details>
<summary>Interacting with Kody</summary>

- **Request a Review:** Ask Kody to review your PR manually by adding a comment with the \`@kody start-review\` command at the root of your PR.

- **Provide Feedback:** Help Kody learn and improve by reacting to its comments with a 👍 for helpful suggestions or a 👎 if improvements are needed.

</details>

<details>
<summary>Current Kody Configuration</summary>

@reviewOptions

</details>

**[Access your configuration settings here.](https://app.kodus.io/settings/code-review/global/general)**

</details>
`;

const miniTableCellClassName = "h-8 px-3 py-1";

const SimpleCollapsible = (
    props: React.PropsWithChildren & { label: string },
) => (
    <details>
        <summary>{props.label}</summary>
        {props.children}
    </details>
);

export const dropdownItems = {
    reviewOptions: {
        label: "Review options",
        description: "Active review options for the repository",
        example: (
            <SimpleCollapsible label="🔧 Review options">
                <p className="text-text-secondary mb-2">
                    The following review options are enabled or disabled:
                </p>
                <Table className="border-card-lv1 w-80 border">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={miniTableCellClassName}>
                                Options
                            </TableHead>
                            <TableHead className={miniTableCellClassName}>
                                Enabled
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                Security
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                ✅
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                Code style
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                ❌
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                Refactoring
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                ❌
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                Error handling
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                ✅
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                colSpan={2}
                                className={miniTableCellClassName}>
                                and more...
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </SimpleCollapsible>
        ),
    },
    changedFiles: {
        label: "Changed files",
        description: "List of changed files in the PR",
        example: (
            <SimpleCollapsible label="📂 Changed files">
                <Table className="border-card-lv1 mt-2 border">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={miniTableCellClassName}>
                                File
                            </TableHead>
                            <TableHead className={miniTableCellClassName}>
                                Status
                            </TableHead>
                            <TableHead
                                className={cn(
                                    miniTableCellClassName,
                                    "text-center",
                                )}>
                                Additions
                            </TableHead>
                            <TableHead
                                className={cn(
                                    miniTableCellClassName,
                                    "text-center",
                                )}>
                                Deletions
                            </TableHead>
                            <TableHead
                                className={cn(
                                    miniTableCellClassName,
                                    "text-center",
                                )}>
                                Changes
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                path/to/folder/file1.js
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                Modified
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                10
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                2
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                12
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={miniTableCellClassName}>
                                path/to/folder/file2.css
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                Added
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                82
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                0
                            </TableCell>
                            <TableCell className={miniTableCellClassName}>
                                82
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className={miniTableCellClassName}>
                                and more...
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </SimpleCollapsible>
        ),
    },
    changeSummary: {
        label: "Changes summary",
        description: "Message summarizing the changes in the PR",
        example: (
            <SimpleCollapsible label="📊 Changes summary">
                <ul className="mt-2 list-disc pl-5">
                    <li>
                        <strong>Total files:</strong> 3
                    </li>

                    <li>
                        <strong>Total lines added:</strong> 503
                    </li>

                    <li>
                        <strong>Total lines removed:</strong> 0
                    </li>

                    <li>
                        <strong>Total changes:</strong> 503
                    </li>
                </ul>
            </SimpleCollapsible>
        ),
    },
} satisfies Record<
    string,
    {
        label: string;
        description: string;
        example: React.JSX.Element;
    }
>;
