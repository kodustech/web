// "use client";

// import { useCallback, useEffect, useState } from "react";
// import SortableCheckinSessionsList, {
//     CheckinSection,
//     CheckinSelectedSession,
// } from "@components/system/sortableCheckinSessions";
// import { Button } from "@components/ui/button";
// import { FormControl } from "@components/ui/form-control";
// import { Input } from "@components/ui/input";
// import { toast } from "@components/ui/toaster/use-toast";
// import {
//     getCheckinConfig,
//     getCheckinSections,
//     saveCheckinConfig,
// } from "@services/checkin/fetch";
// import { Save } from "lucide-react";
// import {
//     convertToBRT,
//     convertToUTC,
//     roundToNearestFiveMinutes,
// } from "src/core/utils/formatHours";
// import { useSelectedTeamId } from "src/core/providers/selected-team-context";
// import { Page } from "@components/ui/page";

export default function WeeklyCheckinConfig() {
    return null;
}

// export default function WeeklyCheckinConfig() {

//     const checkinId = "weekly-checkin";
//     const { teamId } = useSelectedTeamId();

//     const [checkinTime, setCheckinTime] = useState("");

//     const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
//     const [isPostLoading, setIsPostLoading] = useState<boolean>(false);

//     const [checkinSections, setCheckinSections] = useState<CheckinSection[]>(
//         [],
//     );

//     const [selectedCheckinSections, setSelectedCheckinSections] = useState<
//         CheckinSelectedSession[]
//     >([]); // Garantindo que seja um array

//     useEffect(() => {
//         const fetchCheckinConfig = async () => {
//             setIsLoadingConfig(true);
//             try {
//                 const configValue = await getCheckinConfig(checkinId, teamId);
//                 if (configValue) {
//                     setSelectedCheckinSections(configValue.sections || []);
//                     setCheckinTime(
//                         configValue.checkinTime
//                             ? convertToBRT(configValue.checkinTime)
//                             : "",
//                     );
//                 }
//             } catch (error) {
//                 console.error(
//                     "Erro ao buscar as configurações de revisão de código:",
//                     error,
//                 );
//             } finally {
//                 setIsLoadingConfig(false);
//             }
//         };

//         const fetchCheckinSections = async () => {
//             try {
//                 const sections = await getCheckinSections();
//                 const formattedOptions = sections.map((section: any) => ({
//                     id: section.id,
//                     name: section.name,
//                     description: section.description,
//                     active: false,
//                     order: section.order,
//                 }));
//                 setCheckinSections(formattedOptions);
//             } catch (error) {
//                 console.error("Erro ao buscar as seções do checkin:", error);
//             }
//         };

//         fetchCheckinSections();
//         fetchCheckinConfig();
//     }, [teamId]);

//     const handleCheckinSections = useCallback(
//         (selectedOptions: { id: string; active: boolean; order: number }[]) => {
//             const formattedOptions = selectedOptions.map((option) => ({
//                 id: option.id,
//                 active: option.active,
//                 order: option.order,
//             }));
//             setSelectedCheckinSections(formattedOptions);
//         },
//         [checkinSections, selectedCheckinSections],
//     );

//     if (isLoadingConfig) {
//         return <div>Loading settings...</div>;
//     }

//     if (!checkinSections.length) {
//         return <div>No check-in sections found.</div>;
//     }

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         setIsPostLoading(true);
//         try {
//             const config = {
//                 checkinId: checkinId,
//                 checkinName: "Daily Check-in",
//                 frequency: {
//                     mon: false,
//                     tue: false,
//                     wed: false,
//                     thu: false,
//                     fri: true,
//                     sat: false,
//                     sun: false,
//                 },
//                 sections: selectedCheckinSections,
//                 checkinTime: convertToUTC(checkinTime),
//             };

//             await saveCheckinConfig(config, teamId);
//         } catch (error) {
//             console.error("Erro ao salvar as configurações:", error);
//             toast({
//                 title: "Error saving settings",
//                 description:
//                     "An error occurred while saving the settings. Please try again.",
//                 variant: "danger",
//             });
//         } finally {
//             setIsPostLoading(false);
//         }
//     };

//     return (
//         <Page.Root>
//             <Page.Header>
//                 <Page.Title>General settings</Page.Title>

//                 <Page.HeaderActions>
//                     <Button
//                         onClick={handleSubmit}
//                         leftIcon={<Save />}
//                         loading={isPostLoading || isLoadingConfig}>
//                         Save settings
//                     </Button>
//                 </Page.HeaderActions>
//             </Page.Header>

//             <Page.Content className="flex flex-col gap-5">
//             <FormControl.Root>
//                 <FormControl.Label>
//                     Daily check-in time{" "}
//                     <small>
//                         (The weekly check-in happens every Friday at the
//                         selected time)
//                     </small>
//                 </FormControl.Label>

//                 <FormControl.Input>
//                     <Input
//                         step="300"
//                         type="time"
//                         placeholder="10:00"
//                         value={checkinTime}
//                         onChange={(e) => {
//                             const roundedTime = roundToNearestFiveMinutes(
//                                 e.target.value,
//                             );
//                             setCheckinTime(roundedTime);
//                         }}
//                     />
//                 </FormControl.Input>
//             </FormControl.Root>

//             <FormControl.Root>
//                 <FormControl.Label className="mb-2">
//                     Sections to be included in the check-in
//                 </FormControl.Label>

//                 <FormControl.Input>
//                     <SortableCheckinSessionsList
//                         options={checkinSections}
//                         onChange={handleCheckinSections}
//                         defaultValue={selectedCheckinSections}
//                     />
//                 </FormControl.Input>
//             </FormControl.Root>
//             </Page.Content>
//         </Page.Root>
//     );
// }
