// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "src/core/components/ui/button";

// export function ChooseBoardButton() {
//     const router = useRouter();

//     return (
//         <Button
//             className="focus:ring-brand-orange/20 min-h-[50px] w-full rounded-[5px] bg-[#382A41] text-[16px] font-normal tracking-[0.08em] text-white transition-all duration-150 hover:brightness-110 focus:ring-1 md:w-[250px]"
//             onClick={() => {
//                 router.push(`/setup/configuration/azure-boards?edit=${true}`);
//             }}>
//             Choose another board
//         </Button>
//     );
// }

// export default function SaveButton({
//     isDisabled,
//     createOrUpdateColumns,
// }: {
//     isDisabled: boolean;
//     createOrUpdateColumns: () => void;
// }) {
//     return (
//         <div className="relative w-full self-center md:w-52">
//             <Button
//                 disabled={isDisabled}
//                 className="bg-gradient min-h-[50px] w-full self-center overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
//                 onClick={() => createOrUpdateColumns()}>
//                 <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] px-6 transition-all duration-150 hover:bg-[#1412174D] active:bg-[#14121780]">
//                     <p className="text-[18px] font-normal text-white">Save</p>
//                 </div>
//             </Button>
//         </div>
//     );
// }
