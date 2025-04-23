// "use client";

// import { startTransition, useMemo, useOptimistic, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Badge } from "@components/ui/badge";
// import {
//     Card,
//     CardContent,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@components/ui/card";
// import { FormControl } from "@components/ui/form-control";
// import { Switch } from "@components/ui/switch";
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipTrigger,
// } from "@components/ui/tooltip";
// import { AutomationType } from "@enums";
// import { updateTeamAutomationStatus } from "@services/automations/hooks";
// import { TeamAutomation } from "@services/automations/types";
// import { useVerifyConnection } from "@services/codeManagement/hooks";
// import { AlertCircleIcon, LoaderCircle, Settings } from "lucide-react";
// import { useAuth } from "src/core/providers/auth.provider";
// import { useSelectedTeamId } from "src/core/providers/selected-team-context";
// import { captureSegmentEvent } from "src/core/utils/segment";

// const isConfigAvailable = (automationType: AutomationType): boolean => {
//     return [
//         AutomationType.AUTOMATION_CODE_REVIEW,
//         AutomationType.AUTOMATION_DAILY_CHECKIN,
//         AutomationType.AUTOMATION_TEAM_PROGRESS,
//     ].includes(automationType);
// };

// export default function AutomationCard({
//     teamAutomation,
// }: {
//     teamAutomation: TeamAutomation;
// }) {
//     const [isPostLoading, setIsPostLoading] = useState<boolean>(false);
//     const { userId } = useAuth();
//     const router = useRouter();
//     const { teamId } = useSelectedTeamId();

//     const [optimisticStatus, addOptimistic] = useOptimistic(
//         teamAutomation.status,
//     );

//     const {
//         data: codeManagementVerification,
//         isLoading: isCodeManagementVerificationLoading,
//     } = useVerifyConnection(teamId);

//     const updateAutomationStatus = async (newStatus: boolean) => {
//         setIsPostLoading(true);

//         if (newStatus) {
//             await captureSegmentEvent({
//                 userId: userId!,
//                 event: "enable_automation",
//                 properties: {
//                     automation: {
//                         name: teamAutomation.automation.name,
//                         type: teamAutomation.automation.automationType,
//                     },
//                 },
//             });
//         } else {
//             await captureSegmentEvent({
//                 userId: userId!,
//                 event: "disable_automation",
//                 properties: {
//                     automation: {
//                         name: teamAutomation.automation.name,
//                         type: teamAutomation.automation.automationType,
//                     },
//                 },
//             });
//         }

//         await updateTeamAutomationStatus(teamAutomation.uuid, newStatus);

//         startTransition(() => addOptimistic(newStatus));
//         router.refresh();

//         setIsPostLoading(false);
//     };

//     const isUnsupportedPlatform = (platform?: string) =>
//         !["GITHUB", "GITLAB", "BITBUCKET"].includes(platform || "");

//     const isAutomationUnavailable = useMemo(
//         () =>
//             teamAutomation.automation.automationType ===
//                 "AutomationCodeReview" &&
//             (!codeManagementVerification ||
//                 !codeManagementVerification?.isSetupComplete ||
//                 isUnsupportedPlatform(
//                     codeManagementVerification?.platformName,
//                 )),
//         [teamAutomation.automation.automationType, codeManagementVerification],
//     );
//     return (
//         <>
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-base leading-tight">
//                         {teamAutomation.automation.name}
//                     </CardTitle>
//                 </CardHeader>

//                 <div className="flex-1">
//                     <CardContent className="text-text-secondary h-full max-h-40 overflow-auto text-sm">
//                         {teamAutomation.automation.description}
//                     </CardContent>
//                 </div>

//                 <CardFooter className="flex justify-between gap-4">
//                     <FormControl.Root className="flex flex-row items-center gap-2">
//                         <FormControl.Input>
//                             <Switch
//                                 id={teamAutomation.automation.name}
//                                 onCheckedChange={updateAutomationStatus}
//                                 checked={optimisticStatus}
//                                 disabled={
//                                     isPostLoading || isAutomationUnavailable
//                                 }
//                             />
//                         </FormControl.Input>

//                         <FormControl.Label
//                             className="m-0"
//                             htmlFor={teamAutomation.automation.name}>
//                             {teamAutomation.status ? "Enabled" : "Disabled"}
//                         </FormControl.Label>
//                     </FormControl.Root>

//                     <div>
//                         {isAutomationUnavailable &&
//                             (isCodeManagementVerificationLoading ? (
//                                 <LoaderCircle className="animate-spin" />
//                             ) : (
//                                 <Tooltip>
//                                     <TooltipTrigger>
//                                         <AlertCircleIcon className="text-destructive" />
//                                     </TooltipTrigger>

//                                     <TooltipContent>
//                                         You need the{" "}
//                                         {(
//                                             codeManagementVerification?.platformName ??
//                                             "github"
//                                         ).toLowerCase()}{" "}
//                                         configured
//                                     </TooltipContent>
//                                 </Tooltip>
//                             ))}

//                         {isConfigAvailable(
//                             teamAutomation.automation.automationType,
//                         ) && (
//                             <Badge
//                                 variant="outline"
//                                 leftIcon={<Settings className="size-4!" />}
//                                 onClick={() => {
//                                     router.push(
//                                         `/automations/${teamAutomation.automation.automationType}`,
//                                     );
//                                 }}>
//                                 Configure
//                             </Badge>
//                         )}
//                     </div>
//                 </CardFooter>
//             </Card>
//         </>
//     );
// }
