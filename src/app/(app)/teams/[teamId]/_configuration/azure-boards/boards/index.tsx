"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SvgArrowSelect } from "@components/ui/icons/SvgArrowSelect";
import TooltipRadix from "@components/ui/tooltip";
import { useGetBoards } from "@services/projectManagement/hooks";
import BoardSelect from "src/core/components/system/boardSelect";
import { IntegrationsCommon } from "src/core/types";
import { cn } from "src/core/utils/components";

import styles from "../styles.module.css";

interface Board {
    isEditPage: boolean;
    boardSelected?: IntegrationsCommon;
    setBoardSelected: Dispatch<SetStateAction<IntegrationsCommon | undefined>>;
    domainSelected?: IntegrationsCommon;
    teamSelected?: IntegrationsCommon;
    projectSelected?: IntegrationsCommon;
}

const BoardComponent = ({
    boardSelected,
    isEditPage,
    setBoardSelected,
    teamSelected,
    domainSelected,
    projectSelected,
}: Board) => {
    const [isLoading, setIsLoading] = useState(false);

    const { data: boardsData, isLoading: isLoadingBoard } = useGetBoards(
        domainSelected,
        teamSelected,
        projectSelected,
    );

    const [boards, setBoards] = useState<IntegrationsCommon[]>([]);

    useEffect(() => {
        setIsLoading(
            isLoadingBoard || (!teamSelected && !projectSelected && isEditPage),
        );
    }, [teamSelected, isEditPage, isLoadingBoard, projectSelected]);

    useEffect(() => {
        if (boardsData) setBoards(boardsData);

        const fetchData = async () => {
            setBoardSelected(boards?.find((board) => board?.selected));
        };

        fetchData();
    }, [isEditPage, setBoardSelected, boardsData, boards, projectSelected]);

    return (
        <div className={styles.selectsRoot}>
            <p className={styles.subTitle}>Which Board shall we analyze?</p>
            <BoardSelect
                isDisabled={!projectSelected}
                IconRight={<SvgArrowSelect fillOpacity={"1"} />}
                data={{ items: boards }}
                className="self-center"
                labelName={
                    isLoading ? (
                        <div className="animate-pulse text-[16px]">Loading</div>
                    ) : boardSelected?.name ? (
                        <TooltipRadix text={boardSelected?.name}>
                            <p className={cn("text-[16px]")}>
                                {boardSelected?.name}
                            </p>
                        </TooltipRadix>
                    ) : (
                        "Select one Azure board"
                    )
                }
                setInfoSelected={(infoSelected: IntegrationsCommon): void => {
                    setBoardSelected(infoSelected);
                }}
            />
        </div>
    );
};

export default BoardComponent;
