"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SvgArrowSelect } from "@components/ui/icons/SvgArrowSelect";
import TooltipRadix from "@components/ui/tooltip";
import { useGetTeams } from "@services/projectManagement/hooks";
import BoardSelect from "src/core/components/system/boardSelect";
import { IntegrationsCommon } from "src/core/types";
import { cn } from "src/core/utils/components";

import styles from "../styles.module.css";

interface Project {
    isEditPage: boolean;
    teamSelected?: IntegrationsCommon;
    setTeamSelected: Dispatch<SetStateAction<IntegrationsCommon | undefined>>;
    domainSelected?: IntegrationsCommon;
    projectSelected?: IntegrationsCommon;
}

const TeamComponent = ({
    isEditPage,
    teamSelected,
    setTeamSelected,
    domainSelected,
    projectSelected,
}: Project) => {
    const [isLoading, setIsLoading] = useState(true);

    const { data: teamsData, isLoading: isLoadingProject } = useGetTeams(
        domainSelected,
        projectSelected,
    );

    const [teams, setTeams] = useState<IntegrationsCommon[]>([]);

    useEffect(() => {
        setIsLoading(isLoadingProject || (!domainSelected && isEditPage));
    }, [domainSelected, isEditPage, isLoadingProject]);

    useEffect(() => {
        if (teamsData) setTeams(teamsData);

        const fetchData = async () => {
            if (teams && domainSelected) {
                setTeamSelected(teams?.find((team) => team?.selected));
            } else {
                isEditPage && setTeamSelected(undefined);
            }
        };

        fetchData();
    }, [domainSelected, isEditPage, teams, teamsData, setTeamSelected]);

    return (
        <div className={styles.selectsRoot}>
            <p className={styles.subTitle}>
                Choose which Azure Boards Team we will connect to.
            </p>
            <BoardSelect
                isDisabled={!domainSelected}
                IconRight={<SvgArrowSelect fillOpacity={"1"} />}
                data={{ items: teams }}
                className="self-center"
                labelName={
                    isLoading ? (
                        <div className="animate-pulse text-[16px]">Loading</div>
                    ) : teamSelected?.name ? (
                        <TooltipRadix text={teamSelected?.name}>
                            <p className={cn("text-[16px]")}>
                                {teamSelected?.name}
                            </p>
                        </TooltipRadix>
                    ) : (
                        "Select one Azure Boards team"
                    )
                }
                setInfoSelected={(infoSelected: IntegrationsCommon): void => {
                    setTeamSelected(infoSelected);
                }}
            />
        </div>
    );
};

export default TeamComponent;
