"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { useDebounce } from "@hooks/use-debounce";

export const Filters = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get("filter") ?? "daily";

    const [prNumber, setPrNumber] = useState(
        searchParams.get("prNumber") ?? "",
    );
    const debouncedPrNumber = useDebounce(prNumber, 500);

    const [developer, setDeveloper] = useState(
        searchParams.get("developer") ?? "",
    );
    const debouncedDeveloper = useDebounce(developer, 500);

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("filter", value);
        if (value !== "by-pr" && value !== "daily-by-pr") {
            params.delete("prNumber");
        }
        if (value !== "by-developer" && value !== "daily-by-developer") {
            params.delete("developer");
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedPrNumber) {
            params.set("prNumber", debouncedPrNumber);
        } else {
            params.delete("prNumber");
        }

        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedPrNumber, router, pathname, searchParams]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedDeveloper) {
            params.set("developer", debouncedDeveloper);
        } else {
            params.delete("developer");
        }

        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedDeveloper, router, pathname, searchParams]);

    const handlePrNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrNumber(e.target.value);
    };

    const handleDeveloperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeveloper(e.target.value);
    };

    return (
        <div className="flex gap-4">
            <Select
                onValueChange={handleFilterChange}
                defaultValue={currentFilter}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="by-pr">By PR</SelectItem>
                    <SelectItem value="daily-by-pr">Daily by PR</SelectItem>
                    <SelectItem value="by-developer">By Developer</SelectItem>
                    <SelectItem value="daily-by-developer">
                        Daily by Developer
                    </SelectItem>
                </SelectContent>
            </Select>
            {currentFilter === "daily-by-pr" && (
                <Input
                    type="number"
                    placeholder="PR Number"
                    value={prNumber}
                    onChange={handlePrNumberChange}
                    className="w-[150px]"
                />
            )}
            {currentFilter === "daily-by-developer" && (
                <Input
                    type="text"
                    placeholder="Developer"
                    value={developer}
                    onChange={handleDeveloperChange}
                    className="w-[150px]"
                />
            )}
        </div>
    );
};
