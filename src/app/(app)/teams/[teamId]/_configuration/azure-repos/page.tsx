// "use client";

// import { Suspense, use, useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import AzureReposRepositoriesSelector from "@components/system/azureRepos/repositoriesSelector";
// import { Button } from "@components/ui/button";
// import { SvgArrow } from "@components/ui/icons/SvgArrow";
// import {
//     createOrUpdateRepositories,
//     saveCodeManagementConfigs,
// } from "@services/codeManagement/fetch";
// import { useGetOrganizations } from "@services/codeManagement/hooks";
// import { IntegrationsCommon } from "src/core/types";
// import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

// import OrganizationComponent from "./components/organizations";
// import styles from "./styles.module.css";

// const AzureReposConfiguration = (props: {
//     params: Promise<{ teamId: string }>;
// }) => {
//     const params = use(props.params);
//     const { replace, push } = useRouter();
//     const searchParams = useSearchParams();
//     const isEditPage = !!searchParams.get("edit");

//     const { data: organizations, isLoading: isLoadingDomain } =
//         useGetOrganizations();

//     const [disabled, setDisabled] = useState<boolean>(true);
//     const [isError, setIsError] = useState<boolean>(false);

//     const [organizationSelected, setOrganizationSelected] = useState<
//         IntegrationsCommon | undefined
//     >();
//     const [selectedRepositories, setSelectedRepositories] = useState<any[]>([]);

//     useEffect(() => {
//         setOrganizationSelected(undefined);
//     }, []);

//     useEffect(() => {
//         setDisabled(
//             !organizationSelected?.id ||
//                 !selectedRepositories ||
//                 selectedRepositories.length === 0,
//         );
//     }, [organizationSelected, selectedRepositories]);

//     useEffect(() => {
//         if (organizations && organizations?.length > 0) {
//             setOrganizationSelected(
//                 organizations?.find((organization) => organization?.selected),
//             );
//         }
//     }, [organizations, isEditPage]);

//     const saveSelectedInfos = async () => {
//         if (selectedRepositories?.length === 0) {
//             setIsError(true);
//         } else if (
//             organizationSelected?.id &&
//             selectedRepositories?.length > 0
//         ) {
//             setIsError(false);
//             await saveCodeManagementConfigs(
//                 organizationSelected,
//                 params.teamId,
//             );
//             await updateRepositories();
//         }
//     };

//     const updateRepositories = async () => {
//         setDisabled(true);

//         const reposToSave = selectedRepositories.map((repo) => {
//             return {
//                 id: repo.value,
//                 name: repo.label,
//                 project: repo?.project,
//                 selected: true,
//             };
//         });

//         await createOrUpdateRepositories(reposToSave, params.teamId);
//         await revalidateServerSidePath(`/teams/${params.teamId}/integrations`);
//         replace(`/teams/${params.teamId}/integrations`);
//     };

//     return (
//         <Suspense>
//             <div className={styles.contentRoot}>
//                 <div className={styles.root}>
//                     <div className="flex items-center gap-4">
//                         <div
//                             className={styles.backButton}
//                             onClick={() => push(`/teams/${params.teamId}`)}>
//                             <SvgArrow width={30} />
//                         </div>
//                         <span className={styles.title}>
//                             Azure Repos repository setup
//                         </span>
//                     </div>
//                 </div>

//                 <OrganizationComponent
//                     organizationSelected={organizationSelected}
//                     setOrganizationSelected={setOrganizationSelected}
//                     organizationsData={{
//                         data: organizations,
//                         isLoading: isLoadingDomain,
//                     }}
//                 />

//                 {organizations &&
//                     organizations?.length > 1 &&
//                     organizationSelected && (
//                         <>
//                             <div className={styles.subTitle}>
//                                 Tell us which <strong>repositories</strong> we can access:
//                             </div>
//                             <AzureReposRepositoriesSelector
//                                 teamId={params.teamId}
//                                 organizationSelected={organizationSelected}
//                                 selectedRepositories={selectedRepositories}
//                                 setSelectedRepositories={
//                                     setSelectedRepositories
//                                 }
//                             />
//                         </>
//                     )}

//                 <div className="relative mt-10 self-center">
//                     <Button
//                         className="bg-gradient min-h-[50px] w-52 overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
//                         disabled={isError || disabled}
//                         onClick={() => saveSelectedInfos()}>
//                         <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] transition-all duration-150 active:bg-[#14121780] hover:bg-[#1412174D]">
//                             <p className="pb-1 text-[18px] font-normal text-white">
//                                 Save
//                             </p>
//                         </div>
//                     </Button>
//                     {isError && (
//                         <div
//                             className={
//                                 "text-red-500 absolute mt-1 list-disc text-[14px]"
//                             }>
//                             <li>Select at least one repository.</li>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </Suspense>
//     );
// };

// export default AzureReposConfiguration;

export default function AzureReposConfiguration() {
    return null;
}
