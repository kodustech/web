"use client";

import { useCallback, useEffect, useState } from "react";
import SortableCheckinSessionsList, {
    CheckinSection,
    CheckinSelectedSession,
} from "@components/system/sortableCheckinSessions";
import { Button } from "@components/ui/button";
import DaysOfWeekSelector from "@components/ui/daysOfWeekSelector";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { Page } from "@components/ui/page";
import { toast } from "@components/ui/toaster/use-toast";
import {
    getCheckinConfig,
    getCheckinSections,
    saveCheckinConfig,
} from "@services/checkin/fetch";
import { Save } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import {
    convertToBRT,
    convertToUTC,
    roundToNearestFiveMinutes,
} from "src/core/utils/formatHours";

export default function DailyCheckinConfig() {
    const checkinId = "daily-checkin";
    const { teamId } = useSelectedTeamId();

    const [checkinTime, setCheckinTime] = useState("");
    const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
    const [isPostLoading, setIsPostLoading] = useState<boolean>(false);

    const [checkinSections, setCheckinSections] = useState<CheckinSection[]>(
        [],
    );

    const [selectedCheckinSections, setSelectedCheckinSections] = useState<
        CheckinSelectedSession[]
    >([]); // Garantindo que seja um array

    const [daysOfWeek, setDaysOfWeek] = useState<Record<string, boolean>>({
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
    });

    useEffect(() => {
        const fetchCheckinConfig = async () => {
            setIsLoadingConfig(true);
            try {
                const configValue = await getCheckinConfig(checkinId, teamId);
                if (configValue) {
                    setSelectedCheckinSections(configValue.sections || []);
                    setDaysOfWeek(
                        configValue.frequency || {
                            mon: false,
                            tue: false,
                            wed: false,
                            thu: false,
                            fri: false,
                            sat: false,
                            sun: false,
                        },
                    );
                    setCheckinTime(
                        configValue.checkinTime
                            ? convertToBRT(configValue.checkinTime)
                            : "",
                    );
                }
            } catch (error) {
                console.error(
                    "Erro ao buscar as configurações de revisão de código:",
                    error,
                );
            } finally {
                setIsLoadingConfig(false);
            }
        };

        const fetchCheckinSections = async () => {
            try {
                const sections = await getCheckinSections();
                const formattedOptions = sections.map((section: any) => ({
                    id: section.id,
                    name: section.name,
                    description: section.description,
                    active: false,
                    order: section.order,
                }));
                setCheckinSections(formattedOptions);
            } catch (error) {
                console.error("Erro ao buscar as seções do checkin:", error);
            }
        };

        fetchCheckinSections();
        fetchCheckinConfig();
    }, [teamId]);

    const handleCheckinSections = useCallback(
        (selectedOptions: { id: string; active: boolean; order: number }[]) => {
            const formattedOptions = selectedOptions.map((option) => ({
                id: option.id,
                active: option.active,
                order: option.order,
            }));
            setSelectedCheckinSections(formattedOptions);
        },
        [checkinSections, selectedCheckinSections],
    );

    // Função para lidar com a mudança dos dias da semana
    const handleDaysOfWeekChange = (selectedDays: Record<string, boolean>) => {
        setDaysOfWeek(selectedDays);
    };

    if (isLoadingConfig) {
        return <div>Loading settings...</div>;
    }

    if (!checkinSections.length) {
        return <div>No check-in sections found.</div>;
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsPostLoading(true);
        try {
            const config = {
                checkinId: checkinId,
                checkinName: "Daily Check-in",
                frequency: daysOfWeek,
                sections: selectedCheckinSections,
                checkinTime: convertToUTC(checkinTime),
            };

            await saveCheckinConfig(config, teamId);
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);
            toast({
                title: "Error saving settings",
                description:
                    "An error occurred while saving the settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsPostLoading(false);
        }
    };

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>General settings</Page.Title>

                <Page.HeaderActions>
                    <Button
                        onClick={handleSubmit}
                        leftIcon={<Save />}
                        loading={isPostLoading || isLoadingConfig}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="flex flex-col gap-5">
                <FormControl.Root>
                    <FormControl.Label>
                        Days of the week you want to receive the check-in
                    </FormControl.Label>

                    <FormControl.Input>
                        <DaysOfWeekSelector
                            value={daysOfWeek}
                            onChange={handleDaysOfWeekChange}
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <FormControl.Root>
                    <FormControl.Label>
                        Daily check-in time{" "}
                        <small>
                            (We recommend 10 minutes before the daily meeting)
                        </small>
                    </FormControl.Label>

                    <FormControl.Input>
                        <Input
                            type="time"
                            step="300"
                            placeholder="10:00"
                            value={checkinTime}
                            onChange={(e) => {
                                const roundedTime = roundToNearestFiveMinutes(
                                    e.target.value,
                                );
                                setCheckinTime(roundedTime);
                            }}
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <FormControl.Root>
                    <FormControl.Label className="mb-1">
                        Sections to be included in the check-in
                    </FormControl.Label>

                    <SortableCheckinSessionsList
                        options={checkinSections}
                        onChange={handleCheckinSections}
                        defaultValue={selectedCheckinSections}
                    />
                </FormControl.Root>
            </Page.Content>
        </Page.Root>
    );
}
