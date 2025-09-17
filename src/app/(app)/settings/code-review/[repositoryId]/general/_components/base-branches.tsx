import React, { useState, useCallback, useMemo } from "react";
import { FormControl } from "@components/ui/form-control";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Controller, useFormContext } from "react-hook-form";
import { X, Plus, HelpCircle } from "lucide-react";

import type { CodeReviewFormType } from "../../../_types";

type BranchType = 'exclude' | 'contains' | 'wildcard' | 'include';

const getBranchType = (branch: string): BranchType => {
    if (branch.startsWith('!')) {
        return 'exclude';
    }
    if (branch.startsWith('contains:')) {
        return 'contains';
    }
    if (branch === '*') {
        return 'wildcard';
    }
    return 'include';
};

const getBranchVariant = (type: BranchType): 'error' | 'success' | 'primary' | 'helper' => {
    switch (type) {
        case 'exclude':
            return 'error';
        case 'contains':
            return 'success';
        case 'wildcard':
            return 'primary';
        default:
            return 'helper';
    }
};


interface ReviewRules {
    include: string[];
    exclude: string[];
    contains: string[];
    wildcard: string[];
}

// Função que converte a expressão do frontend para o formato do backend
const processBranchExpression = (branches: string[]): { reviewRules: ReviewRules } => {
    const reviewRules: ReviewRules = {
        include: [],
        exclude: [],
        contains: [],
        wildcard: [],
    };

    branches.forEach(branch => {
        const trimmedBranch = branch.trim();

        if (trimmedBranch.startsWith('!')) {
            // Exclusão: !branch ou !pattern/*
            reviewRules.exclude.push(trimmedBranch.substring(1));
        } else if (trimmedBranch.startsWith('contains:')) {
            // Busca por conteúdo: contains:text
            reviewRules.contains.push(trimmedBranch.substring(9));
        } else if (trimmedBranch === '*') {
            // Wildcard universal: *
            reviewRules.wildcard.push(trimmedBranch);
        } else {
            // Inclusão normal: branch ou pattern/*
            reviewRules.include.push(trimmedBranch);
        }
    });

    return { reviewRules };
};

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

const MAX_BRANCH_LENGTH = 100;
const INVALID_CHARS_REGEX = /[<>:"|?\x00-\x1f]/;

const validateBranchExpression = (branch: string): ValidationResult => {
    const trimmedBranch = branch.trim();

    // Verificar comprimento
    if (trimmedBranch.length > MAX_BRANCH_LENGTH) {
        return { isValid: false, error: `Branch name too long (max ${MAX_BRANCH_LENGTH} characters)` };
    }

    // Verificar se está vazio
    if (trimmedBranch.length === 0) {
        return { isValid: false, error: 'Branch name cannot be empty' };
    }

    // Verificar caracteres inválidos (exceto * que é permitido como wildcard)
    if (INVALID_CHARS_REGEX.test(trimmedBranch)) {
        return { isValid: false, error: 'Branch name contains invalid characters' };
    }

    // Verificar sintaxe específica para expressões
    if (trimmedBranch.startsWith('contains:')) {
        const content = trimmedBranch.substring(9);
        if (content.length === 0) {
            return { isValid: false, error: 'Contains expression needs content after colon' };
        }
    }

    if (trimmedBranch.startsWith('!')) {
        const content = trimmedBranch.substring(1);
        if (content.length === 0) {
            return { isValid: false, error: 'Exclusion needs branch name after !' };
        }
    }

    return { isValid: true };
};

export const BaseBranches = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="baseBranches"
            control={form.control}
            render={({ field }) => {
                const [inputValue, setInputValue] = useState("");
                const [validationError, setValidationError] = useState<string | null>(null);

                const addBranch = useCallback((branch: string) => {
                    const trimmedBranch = branch.trim();

                    // Validar a expressão
                    const validation = validateBranchExpression(trimmedBranch);
                    if (!validation.isValid) {
                        setValidationError(validation.error || 'Invalid branch expression');
                        return;
                    }

                    // Verificar se já existe
                    if (field.value.includes(trimmedBranch)) {
                        setValidationError('Branch already exists');
                        return;
                    }

                    // Adicionar branch
                    field.onChange([...field.value, trimmedBranch]);
                    setInputValue("");
                    setValidationError(null);
                }, [field]);

                const removeBranch = useCallback((branchToRemove: string) => {
                    field.onChange(field.value.filter((branch: string) => branch !== branchToRemove));
                }, [field]);

                const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                    setInputValue(e.target.value);
                    setValidationError(null);
                }, []);

                const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addBranch(inputValue);
                    }
                }, [inputValue, addBranch]);

                const handleAddClick = useCallback(() => {
                    addBranch(inputValue);
                }, [inputValue, addBranch]);


                return (
                    <FormControl.Root>
                        <div className="flex items-center gap-2">
                            <FormControl.Label htmlFor={field.name}>
                                Base Branches
                            </FormControl.Label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="ml-1 flex items-center">
                                        <HelpCircle
                                            size={16}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Branch Configuration Guide</DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold mb-3">Expression Types</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="helper" className="text-xs">branch</Badge>
                                                    <span className="text-sm">Include specific branches (e.g., <code className="bg-muted px-1 rounded text-xs">develop</code>, <code className="bg-muted px-1 rounded text-xs">feature/*</code>)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="error" className="text-xs">!branch</Badge>
                                                    <span className="text-sm">Exclude specific branches (e.g., <code className="bg-muted px-1 rounded text-xs">!main</code>, <code className="bg-muted px-1 rounded text-xs">!feature/*</code>)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="success" className="text-xs">contains:text</Badge>
                                                    <span className="text-sm">Include branches containing text (e.g., <code className="bg-muted px-1 rounded text-xs">contains:hotfix</code>)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="primary" className="text-xs">*</Badge>
                                                    <span className="text-sm">Universal wildcard - review ALL branches</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-3">Practical Examples</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <strong className="text-sm">GitFlow</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">feature/*, hotfix/*</code>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <div>✅ <code className="bg-background px-1 rounded">feature/xyz → develop</code> = REVIEW</div>
                                                        <div>✅ <code className="bg-background px-1 rounded">hotfix/urgent → main</code> = REVIEW</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <strong className="text-sm">With Exclusions</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">feature/*, hotfix/*, !main</code>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <div>❌ <code className="bg-background px-1 rounded">feature/xyz → main</code> = NO REVIEW (excluded)</div>
                                                        <div>✅ <code className="bg-background px-1 rounded">feature/xyz → develop</code> = REVIEW</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <strong className="text-sm">Review Everything Except</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">*, !main, !develop, !release/*</code>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <div>❌ <code className="bg-background px-1 rounded">any → main</code> = NO REVIEW (excluded)</div>
                                                        <div>❌ <code className="bg-background px-1 rounded">any → develop</code> = NO REVIEW (excluded)</div>
                                                        <div>✅ <code className="bg-background px-1 rounded">any → staging</code> = REVIEW</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <strong className="text-sm">Client Flow (Aggregation Branch)</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">feature/aggregation, !develop, !main, !release</code>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <div>✅ <code className="bg-background px-1 rounded">feature/xyz → feature/aggregation</code> = REVIEW</div>
                                                        <div>❌ <code className="bg-background px-1 rounded">feature/xyz → develop</code> = NO REVIEW (excluded)</div>
                                                        <div>❌ <code className="bg-background px-1 rounded">feature/xyz → main</code> = NO REVIEW (excluded)</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-3">How to Use Combinations</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <strong className="text-sm">Include + Exclude</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">feature/*, !main</code>
                                                    <span className="text-xs text-muted-foreground">Reviews <code className="bg-background px-1 rounded">feature/*</code> branches EXCEPT when targeting <code className="bg-background px-1 rounded">main</code></span>
                                                </div>
                                                <div>
                                                    <strong className="text-sm">Everything + Exclude</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">*, !main, !develop</code>
                                                    <span className="text-xs text-muted-foreground">Reviews ALL branches EXCEPT when targeting <code className="bg-background px-1 rounded">main</code> or <code className="bg-background px-1 rounded">develop</code></span>
                                                </div>
                                                <div>
                                                    <strong className="text-sm">Specific + Exclude</strong>
                                                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono mt-1">feature/aggregation, !develop</code>
                                                    <span className="text-xs text-muted-foreground">Reviews <code className="bg-background px-1 rounded">feature/aggregation</code> EXCEPT when targeting <code className="bg-background px-1 rounded">develop</code></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <h3 className="font-semibold mb-3">💡 Tips</h3>
                                            <ul className="text-sm space-y-2">
                                                <li>• <strong>Order doesn't matter</strong> - expressions can be in any order</li>
                                                <li>• <strong>Use <code className="bg-background px-1 rounded text-xs">*</code></strong> to review all branches</li>
                                                <li>• <strong>Use <code className="bg-background px-1 rounded text-xs">!</code></strong> to exclude specific branches</li>
                                                <li>• <strong>Maximum 100 characters</strong> per expression</li>
                                                <li>• <strong>All configurations are TARGET patterns</strong> - they define which branches can receive PRs</li>
                                            </ul>
                                        </div>

                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <h3 className="font-semibold mb-2 text-sm">🔑 Key Concept</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <strong>All branch configurations define TARGET branches (where PRs can go):</strong>
                                            </p>
                                            <ul className="text-xs space-y-1 text-muted-foreground">
                                                <li>• <code className="bg-background px-1 rounded">['develop', 'main']</code> = "Any branch can go to develop or main"</li>
                                                <li>• <code className="bg-background px-1 rounded">['feature/*']</code> = "Any branch can go to branches starting with feature/"</li>
                                                <li>• <code className="bg-background px-1 rounded">['!main']</code> = "Any branch CANNOT go to main"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <FormControl.Input>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <Input
                                        id={field.name}
                                        type="text"
                                        disabled={field.disabled}
                                        value={inputValue}
                                        maxLength={MAX_BRANCH_LENGTH}
                                        placeholder="Press Enter to add a branch or expression (!, contains:, *)"
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                    />

                                    {inputValue && (
                                        <Badge
                                            className="absolute top-1/2 right-2 -translate-y-1/2"
                                            leftIcon={<Plus className="size-3" />}
                                            onClick={handleAddClick}>
                                            Add item
                                        </Badge>
                                    )}
                                </div>

                                {validationError && (
                                    <div className="text-red-600 text-sm">
                                        {validationError}
                                    </div>
                                )}

                                {field.value.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {field.value.map((branch: string) => {
                                            const type = getBranchType(branch);
                                            const variant = getBranchVariant(type);

                                            return (
                                                <Badge
                                                    key={branch}
                                                    variant={variant}
                                                    disabled={field.disabled}
                                                    onClick={() => removeBranch(branch)}
                                                >
                                                    {branch}
                                                    <X className="text-danger -mr-1 h-4 w-4" />
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </FormControl.Input>

                        <FormControl.Helper>
                            Base branches (besides the default branch) to review. 100 characters maximum per branch.
                        </FormControl.Helper>
                    </FormControl.Root>
                );
            }}
        />
    );
};

<<<<<<< Updated upstream
=======
const HelpModal = () => (
    <Dialog open onOpenChange={magicModal.hide}>
        <DialogContent className="max-h-[90vh] max-w-4xl pb-0">
            <DialogHeader>
                <DialogTitle>Branch Configuration Guide</DialogTitle>
            </DialogHeader>

            <div className="-mx-6 space-y-6 overflow-y-auto px-6 py-6">
                <Heading variant="h3" className="mb-2 text-base">
                    Expression Types
                </Heading>

                <Card color="lv1" className="rounded-none">
                    <Table className="**:border-card-lv2 *:border">
                        <TableBody>
                            <TableRow>
                                <TableCell className="w-40">
                                    <Badge
                                        variant="helper"
                                        className="pointer-events-none">
                                        branch
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        Allow PRs TO specific branches (e.g.,{" "}
                                        <InlineCode>develop</InlineCode>,{" "}
                                        <InlineCode>feature/*</InlineCode>)
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Badge
                                        variant="error"
                                        className="pointer-events-none">
                                        !branch
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        Block PRs TO specific branches (e.g.,{" "}
                                        <InlineCode>!main</InlineCode>,{" "}
                                        <InlineCode>!feature/*</InlineCode>)
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Badge
                                        variant="success"
                                        className="pointer-events-none">
                                        contains:text
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        Allow PRs TO branches containing text (e.g.,{" "}
                                        <InlineCode>contains:hotfix</InlineCode>
                                        )
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Badge
                                        variant="primary"
                                        className="pointer-events-none">
                                        *
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        Universal wildcard - allow PRs TO ALL branches
                                    </span>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>

                <Alert variant="info">
                    <KeyIcon />
                    <AlertTitle>Key Concept</AlertTitle>

                    <AlertDescription>
                        <p className="text-muted-foreground mb-2 text-sm">
                            <strong>
                                All configurations define TARGET branches (where PRs are allowed to go):
                            </strong>
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-sm">
                            <li>
                                <InlineCode>['develop', 'main']</InlineCode> =
                                "Any branch can make PRs TO develop or main"
                            </li>
                            <li>
                                <InlineCode>['feature/*']</InlineCode> = "Any
                                branch can make PRs TO branches starting with
                                feature/"
                            </li>
                            <li>
                                <InlineCode>['!main']</InlineCode> = "Any branch
                                CANNOT make PRs TO main"
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <div className="mt-8">
                    <Heading variant="h3" className="mb-2 text-base">
                        Examples
                    </Heading>

                    <div className="flex flex-col gap-4">
                        <Card color="lv1" className="rounded-none">
                            <Table className="**:border-card-lv2 *:border">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead colSpan={2}>
                                            <div>
                                                <strong className="mr-1 text-sm">
                                                    Simple - Only Main
                                                </strong>
                                                <InlineCode>
                                                    ["main"]
                                                </InlineCode>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → main
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                hotfix/urgent → main
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → develop
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <XIcon className="text-danger" />
                                                NO REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>

                        <Card color="lv1" className="rounded-none">
                            <Table className="**:border-card-lv2 *:border">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead colSpan={2}>
                                            <div>
                                                <strong className="mr-1 text-sm">
                                                    GitFlow with Exclusions
                                                </strong>
                                                <InlineCode>
                                                    ["develop", "feature/*", "main", "!release/*"]
                                                </InlineCode>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → develop
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → main
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                hotfix/urgent → feature/abc
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → release/v1.0
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <XIcon className="text-danger" />
                                                NO REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>

                        <Card color="lv1" className="rounded-none">
                            <Table className="**:border-card-lv2 *:border">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead colSpan={2}>
                                            <div>
                                                <strong className="mr-1 text-sm">
                                                    Everything Except Main
                                                </strong>
                                                <InlineCode>
                                                    ["*", "!main"]
                                                </InlineCode>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>feature/xyz → develop</InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → staging
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → main
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <XIcon className="text-danger" />
                                                NO REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>

                        <Card color="lv1" className="rounded-none">
                            <Table className="**:border-card-lv2 *:border">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead colSpan={2}>
                                            <div>
                                                <strong className="mr-1 text-sm">
                                                    Client Flow (Aggregation Branch)
                                                </strong>
                                                <InlineCode>
                                                    ["feature/aggregation", "!develop", "!main", "!release"]
                                                </InlineCode>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → feature/aggregation
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                hotfix/urgent → feature/aggregation
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <CheckIcon className="text-success" />
                                                REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → develop
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <XIcon className="text-danger" />
                                                NO REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="w-1/2">
                                            <InlineCode>
                                                feature/xyz → main
                                            </InlineCode>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <XIcon className="text-danger" />
                                                NO REVIEW
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                <Alert variant="warning">
                    <LightbulbIcon />
                    <AlertTitle>Tips</AlertTitle>

                    <AlertDescription>
                        <ul className="list-inside list-disc space-y-2 text-sm">
                            <li>
                                <strong>Order doesn't matter</strong> -
                                expressions can be in any order
                            </li>
                            <li>
                                <strong>
                                    Use <InlineCode>*</InlineCode>
                                </strong>{" "}
                                to allow PRs to all branches
                            </li>
                            <li>
                                <strong>
                                    Use <InlineCode>!</InlineCode>
                                </strong>{" "}
                                to block PRs to specific branches
                            </li>
                            <li>
                                <strong>Maximum 100 characters</strong> per
                                expression
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>
        </DialogContent>
    </Dialog>
);
>>>>>>> Stashed changes
