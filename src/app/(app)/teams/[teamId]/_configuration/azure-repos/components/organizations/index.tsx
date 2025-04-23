// "use client";

// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { SvgArrowSelect } from "@components/ui/icons/SvgArrowSelect";
// import TooltipRadix from "@components/ui/tooltip";
// import BoardSelect from "src/core/components/system/boardSelect";
// import { IntegrationsCommon } from "src/core/types";
// import { cn } from "src/core/utils/components";

// import styles from "../../styles.module.css";

// interface Organization {
//     organizationSelected?: IntegrationsCommon;
//     setOrganizationSelected: Dispatch<SetStateAction<IntegrationsCommon | undefined>>;
//     organizationsData: { isLoading: boolean; data?: IntegrationsCommon[] };
// }

// const OrganizationComponent = ({
//     organizationSelected,
//     setOrganizationSelected,
//     organizationsData,
// }: Organization) => {
//     const [organizations, setOrganizations] = useState<IntegrationsCommon[]>([]);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (organizationsData) {
//                 setOrganizations(organizationsData?.data || [])
//             };
//         };

//         fetchData();
//     }, [organizationsData]);

//     return (
//         <div className={styles.selectsRoot}>
//             <p className={styles.subTitle}>
//                 Select the Azure Repos organization we will be working with.
//             </p>
//             <BoardSelect
//                 IconRight={<SvgArrowSelect fillOpacity={"1"} />}
//                 data={{ items: organizations }}
//                 className="self-center"
//                 labelName={
//                     organizationsData?.isLoading ? (
//                         <div className="animate-pulse text-[16px]">Loading</div>
//                     ) : organizationSelected?.name ? (
//                         <TooltipRadix text={organizationSelected?.name}>
//                             <p className={cn("text-[16px]")}>
//                                 {organizationSelected?.name}
//                             </p>
//                         </TooltipRadix>
//                     ) : (
//                         "Select one Azure Repos Organization"
//                     )
//                 }
//                 setInfoSelected={(infoSelected: IntegrationsCommon): void => {
//                     setOrganizationSelected(infoSelected);
//                 }}
//             />
//         </div>
//     );
// };

// export default OrganizationComponent;
