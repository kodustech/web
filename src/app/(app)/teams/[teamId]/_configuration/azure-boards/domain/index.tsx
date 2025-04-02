"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SvgArrowSelect } from "@components/ui/icons/SvgArrowSelect";
import TooltipRadix from "@components/ui/tooltip";
import BoardSelect from "src/core/components/system/boardSelect";
import { IntegrationsCommon } from "src/core/types";
import { cn } from "src/core/utils/components";

import styles from "../styles.module.css";

interface Domain {
    domainSelected?: IntegrationsCommon;
    setDomainSelected: Dispatch<SetStateAction<IntegrationsCommon | undefined>>;
    domainsData: { isLoading: boolean; data?: IntegrationsCommon[] };
}

const DomainComponent = ({
    domainSelected,
    setDomainSelected,
    domainsData,
}: Domain) => {
    const [domains, setDomains] = useState<IntegrationsCommon[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (domainsData) setDomains(domainsData?.data || []);
        };

        fetchData();
    }, [domainsData]);

    return (
        <div className={styles.selectsRoot}>
            <p className={styles.subTitle}>
                Select the Azure Boards Domain we will be working on.
            </p>
            <BoardSelect
                IconRight={<SvgArrowSelect fillOpacity={"1"} />}
                data={{ items: domains }}
                className="self-center"
                labelName={
                    domainsData?.isLoading ? (
                        <div className="animate-pulse text-[16px]">Loading</div>
                    ) : domainSelected?.name ? (
                        <TooltipRadix text={domainSelected?.name}>
                            <p className={cn("text-[16px]")}>
                                {domainSelected?.name}
                            </p>
                        </TooltipRadix>
                    ) : (
                        "Select one Azure Boards domain"
                    )
                }
                setInfoSelected={(infoSelected: IntegrationsCommon): void => {
                    setDomainSelected(infoSelected);
                }}
            />
        </div>
    );
};

export default DomainComponent;
