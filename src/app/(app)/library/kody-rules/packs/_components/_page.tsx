"use client";

import { useState, useMemo } from "react";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { Input } from "@components/ui/input";
import { 
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { SearchIcon } from "lucide-react";
import type { KodyRuleBucket, LibraryRule } from "@services/kodyRules/types";

export const KodyRulesPacksExplorer = ({ 
    buckets 
}: { 
    buckets: (KodyRuleBucket & { rulesCount: number; sampleRules: LibraryRule[] })[];
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter buckets based on search query
    const filteredBuckets = useMemo(() => {
        if (!searchQuery.trim()) return buckets;
        
        return buckets.filter(bucket => 
            bucket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bucket.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [buckets, searchQuery]);
    // Get severity badge color
    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'bg-[rgba(255,139,64,0.1)] border-[rgba(255,139,64,0.64)] text-[#ff8b40]';
            case 'medium':
                return 'bg-[rgba(242,198,49,0.1)] border-[rgba(242,198,49,0.64)] text-[#f2c631]';
            case 'low':
                return 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.64)] text-[#22c55e]';
            case 'critical':
                return 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.64)] text-[#ef4444]';
            default:
                return 'bg-[rgba(242,198,49,0.1)] border-[rgba(242,198,49,0.64)] text-[#f2c631]';
        }
    };

    // Bucket Card Component for packs page
const PackCard = ({ bucket, sampleRules }: {
    bucket: KodyRuleBucket;
    sampleRules: LibraryRule[];
}) => (
        <div className="bg-[#181825] border border-[#30304b] rounded-lg p-6 hover:border-[#f8b76d] transition-colors">
            <Link 
                href={`/library/kody-rules?view=browse&bucket=${bucket.slug}`}
                noHoverUnderline
                className="block"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#202032] p-3 rounded-lg">
                        <div className="w-6 h-6 text-[#f8b76d]">⚖️</div>
                    </div>
                                           <div>
                           <h3 className="font-bold text-white text-base">{bucket.title}</h3>
                           <p className="text-[#cdcddf] text-sm">{bucket.rulesCount} rules available</p>
                       </div>
                </div>
                <p className="text-[#cdcddf] text-sm leading-relaxed mb-6 min-h-[3rem]">
                    {bucket.description}
                </p>
            
                {/* Highlighted rules section */}
                {sampleRules.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-bold text-white text-sm mb-3">Highlighted rules</h4>
                        <div className="space-y-2">
                            {sampleRules.map((rule, index) => (
                                <div key={index} className="bg-[#202032] rounded p-4 flex items-start justify-between">
                                    <div className="flex-1 pr-3">
                                        <h5 className="font-bold text-white text-xs mb-1 line-clamp-1">
                                            {rule.title}
                                        </h5>
                                        <p className="text-[#cdcddf] text-xs line-clamp-2 leading-relaxed">
                                            {rule.rule.length > 100 ? `${rule.rule.substring(0, 100)}...` : rule.rule}
                                        </p>
                                    </div>
                                    <div className={`${getSeverityColor(rule.severity)} border rounded px-2 py-1 flex-shrink-0`}>
                                        <span className="text-xs font-semibold uppercase">{rule.severity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-[#f8b76d] text-sm font-bold">
                    Explore pack →
                </div>
            </Link>
        </div>
    );

    return (
        <Page.Root>
            <Page.Header>
                <div className="flex flex-col gap-1 w-full">
                    <Breadcrumb className="mb-1">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/library/kody-rules/featured">
                                    Rules Library
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Rules Packs</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-5">
                        <Page.Title className="text-2xl font-bold">
                            Rules Packs
                        </Page.Title>
                        <span className="text-[#cdcddf] text-sm">
                            {filteredBuckets.length} of {buckets.length} packs
                        </span>
                    </div>
                    <p className="text-[#cdcddf] text-sm">
                        Rule packs, organized for your use case.
                    </p>
                    <div className="max-w-mdm mt-5 w-full">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#79799f] h-4 w-4" />
                            <Input
                                placeholder="Search packs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-[#181825] border-[#30304b] text-white placeholder-[#79799f] focus:border-[#f8b76d]"
                            />
                        </div>
                    </div>
                </div>
            </Page.Header>

            <Page.Content>
                <Separator />

                {filteredBuckets.length === 0 ? (
                    <div className="text-text-secondary flex flex-col items-center gap-2 text-sm py-12">
                        <SearchIcon className="h-8 w-8 text-[#79799f]" />
                        <p>No packs found matching "{searchQuery}"</p>
                        <p className="text-xs text-[#79799f]">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {filteredBuckets.map((bucket) => (
                            <PackCard 
                                key={bucket.slug}
                                bucket={bucket} 
                                sampleRules={bucket.sampleRules}
                            />
                        ))}
                    </div>
                )}
            </Page.Content>
        </Page.Root>
    );
};
