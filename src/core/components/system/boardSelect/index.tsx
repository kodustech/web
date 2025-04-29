// import { useMemo, useState } from "react";
// import { Button } from "@components/ui/button";
// import {
//     Command,
//     CommandGroup,
//     CommandItem,
//     CommandList,
// } from "@components/ui/command";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@components/ui/popover";
// import { toast } from "@components/ui/toaster/use-toast";
// import * as PopoverPrimitive from "@radix-ui/react-popover";
// import { IntegrationsCommon } from "src/core/types";
// import { cn } from "src/core/utils/components";

// import styles from "./styles.module.css";

// interface ErrorResponse {
//     status: number;
//     userMessage: string;
//     developerMessage?: string;
// }

// interface DataWithStatus {
//     items?: IntegrationsCommon[];
//     error?: ErrorResponse;
// }

// type ButtonSelectType = {
//     data: DataWithStatus;
//     labelName: React.ReactNode;
//     setInfoSelected: (project: IntegrationsCommon) => void;
//     IconLeft?: React.ReactNode;
//     IconRight?: React.ReactNode;
//     className?: string;
//     isDisabled?: boolean;
// };

// export default function BoardSelect(props: ButtonSelectType) {
//     const {
//         data,
//         labelName,
//         IconLeft,
//         IconRight,
//         className,
//         setInfoSelected,
//         isDisabled,
//     } = props;

//     const [open, setOpen] = useState(false);

//     const items = useMemo<IntegrationsCommon[]>(() => {
//         if (Array.isArray(data)) return data;

//         if ("error" in data && data.error?.status === 400) {
//             toast({
//                 description: data.error?.userMessage,
//                 variant: "danger",
//             });

//             return [];
//         }

//         return Array.isArray(data.items) ? data.items : [];
//     }, [data]);

//     const getItemNameAndPrivacy = (item: IntegrationsCommon) => {
//         if (typeof item.isPrivate !== "undefined") {
//             return `${item.name} - ${item.isPrivate ? "Private" : "Public"}`;
//         }
//         return item.name;
//     };

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     size="lg"
//                     variant="helper"
//                     disabled={isDisabled}
//                     className={cn(
//                         "border-brand-purple/20 h-auto w-full gap-5 rounded-[5px] border bg-[#292031] px-5 py-4 text-[#DFD8F5] transition-all duration-200 hover:bg-[#292031]",
//                         open ? "border-[#FF810A80]" : "",
//                         className,
//                     )}>
//                     <div className="flex max-h-max w-full items-center justify-start gap-5 text-start">
//                         {IconLeft}
//                         {labelName}
//                     </div>
//                     {IconRight}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent
//                 sideOffset={10}
//                 className="w-[calc(100vw-40px)] border-none bg-[#382A41] p-2 md:max-w-[calc(100vw-64px)] lg:w-[874px]">
//                 <Command className="border-none bg-[#382A41]">
//                     <CommandList className={"max-h-[300px] py-1"}>
//                         <CommandGroup
//                             className={cn(
//                                 "mt-2 h-52 overflow-auto bg-[#382A41]",
//                                 styles.scroll,
//                             )}>
//                             {items.map((info) => (
//                                 <CommandItem
//                                     key={info.id}
//                                     onSelect={() => {
//                                         setInfoSelected(info);
//                                         setOpen(false);
//                                     }}
//                                     className="bg-[#14121733] py-2 hover:cursor-pointer aria-selected:bg-[#935c2d]">
//                                     {getItemNameAndPrivacy(info)}
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                     <PopoverPrimitive.Arrow className="-mb-4 fill-[#382A41]" />
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// }
