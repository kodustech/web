"use client";

import { Suspense, useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { SvgArrow } from "@components/ui/icons/SvgArrow";
import { saveProjectManagementConfigs } from "@services/projectManagement/fetch";
import { useGetDomains } from "@services/projectManagement/hooks";
import { IntegrationsCommon } from "src/core/types";

import BoardComponent from "./boards";
import DomainComponent from "./domain";
import ProjectComponent from "./projects";
import styles from "./styles.module.css";
import TeamComponent from "./teams";

const AzureBoardsConfiguration = (
    props: {
        params: Promise<{ teamId: string }>;
    }
) => {
    const params = use(props.params);
    const { replace } = useRouter();
    const searchParams = useSearchParams();
    const isEditPage = !!searchParams.get("edit");

    const { data: domains, isLoading: isLoadingDomain } = useGetDomains(params.teamId);

    const [disabled, setDisabled] = useState<boolean>(true);

    const [domainSelected, setDomainSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [projectSelected, setProjectSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [teamSelected, setTeamSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [boardSelected, setBoardSelected] = useState<
        IntegrationsCommon | undefined
    >();

    useEffect(() => {
        setDomainSelected(undefined);
        setProjectSelected(undefined);
        setTeamSelected(undefined);
        setBoardSelected(undefined);
    }, []);

    useEffect(() => {
        setDisabled(!projectSelected?.id || !boardSelected?.id);
    }, [boardSelected, projectSelected]);

    useEffect(() => {
        if (domains?.length === 1 || (isEditPage && domains)) {
            setDomainSelected(domains?.find((domain) => domain?.selected));
        }
    }, [domains, isEditPage]);

    const saveSelectedInfos = async () => {
        await saveProjectManagementConfigs(
            {
                domainSelected,
                projectSelected,
                teamSelected,
                boardSelected,
            },
            params.teamId,
        );
        replace(
            `teams/${params?.teamId}/azure-boards/configuration/select-columns`,
        );
    };

    return (
        <Suspense>
            <div className={styles.contentRoot}>
                <div className={styles.header}>
                    <div className="flex items-center gap-4">
                        <div
                            className={styles.backButton}
                            onClick={() => {
                                replace("/setup");
                            }}>
                            <SvgArrow width={30} />
                        </div>
                        <span className={styles.title}>Azure Boards Setup</span>
                    </div>
                </div>

                <DomainComponent
                    domainSelected={domainSelected}
                    setDomainSelected={setDomainSelected}
                    domainsData={{
                        data: domains,
                        isLoading: isLoadingDomain,
                    }}
                />

                {domains && domains?.length > 1 && domainSelected && (
                    <>
                        <ProjectComponent
                            projectSelected={projectSelected}
                            isEditPage={isEditPage}
                            setProjectSelected={setProjectSelected}
                            domainSelected={domainSelected}
                        />

                        {domainSelected && projectSelected && (
                            <TeamComponent
                                teamSelected={teamSelected}
                                isEditPage={isEditPage}
                                setTeamSelected={setTeamSelected}
                                domainSelected={domainSelected}
                                projectSelected={projectSelected}
                            />
                        )}

                        {domainSelected && projectSelected && teamSelected && (
                            <BoardComponent
                                boardSelected={boardSelected}
                                isEditPage={isEditPage}
                                setBoardSelected={setBoardSelected}
                                domainSelected={domainSelected}
                                teamSelected={teamSelected}
                                projectSelected={projectSelected}
                            />
                        )}
                    </>
                )}

                <Button
                    className="bg-gradient mt-10 min-h-[50px] w-max self-center overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
                    disabled={disabled}
                    onClick={() => saveSelectedInfos()}>
                    <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] px-6 transition-all duration-150 hover:bg-[#1412174D] active:bg-[#14121780]">
                        <p className="pb-1 text-[18px] font-normal text-white">
                            Setup Board Columns
                        </p>
                        <SvgArrow fill="white" fillOpacity="1" width={20} />
                    </div>
                </Button>
            </div>
        </Suspense>
    );
};

export default AzureBoardsConfiguration;
