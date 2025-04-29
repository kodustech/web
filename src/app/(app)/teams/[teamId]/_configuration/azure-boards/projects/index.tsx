// "use client";

// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { SvgArrowSelect } from "@components/ui/icons/SvgArrowSelect";
// import TooltipRadix from "@components/ui/tooltip";
// import { useGetProjects } from "@services/projectManagement/hooks";
// import BoardSelect from "src/core/components/system/boardSelect";
// import { IntegrationsCommon } from "src/core/types";
// import { cn } from "src/core/utils/components";

// import styles from "../styles.module.css";

// interface Project {
//     isEditPage: boolean;
//     projectSelected?: IntegrationsCommon;
//     setProjectSelected: Dispatch<
//         SetStateAction<IntegrationsCommon | undefined>
//     >;
//     domainSelected?: IntegrationsCommon;
// }

// const ProjectComponent = ({
//     isEditPage,
//     projectSelected,
//     setProjectSelected,
//     domainSelected,
// }: Project) => {
//     const [isLoading, setIsLoading] = useState(true);

//     const { data: projectsData, isLoading: isLoadingProject } =
//         useGetProjects(domainSelected);

//     const [projects, setProjects] = useState<IntegrationsCommon[]>([]);

//     useEffect(() => {
//         setIsLoading(isLoadingProject || (!domainSelected && isEditPage));
//     }, [domainSelected, isEditPage, isLoadingProject]);

//     useEffect(() => {
//         if (projectsData) setProjects(projectsData);

//         const fetchData = async () => {
//             if (projects && domainSelected) {
//                 setProjectSelected(
//                     projects?.find((project) => project?.selected),
//                 );
//             } else {
//                 isEditPage && setProjectSelected(undefined);
//             }
//         };

//         fetchData();
//     }, [
//         domainSelected,
//         isEditPage,
//         projects,
//         projectsData,
//         setProjectSelected,
//     ]);

//     return (
//         <div className={styles.selectsRoot}>
//             <p className={styles.subTitle}>
//                 Choose which Azure Boards Project we will connect to.
//             </p>
//             <BoardSelect
//                 isDisabled={!domainSelected}
//                 IconRight={<SvgArrowSelect fillOpacity={"1"} />}
//                 data={{ items: projects }}
//                 className="self-center"
//                 labelName={
//                     isLoading ? (
//                         <div className="animate-pulse text-[16px]">Loading</div>
//                     ) : projectSelected?.name ? (
//                         <TooltipRadix text={projectSelected?.name}>
//                             <p className={cn("text-[16px]")}>
//                                 {projectSelected?.name}
//                             </p>
//                         </TooltipRadix>
//                     ) : (
//                         "Select one Azure Boards project"
//                     )
//                 }
//                 setInfoSelected={(infoSelected: IntegrationsCommon): void => {
//                     setProjectSelected(infoSelected);
//                 }}
//             />
//         </div>
//     );
// };

// export default ProjectComponent;
