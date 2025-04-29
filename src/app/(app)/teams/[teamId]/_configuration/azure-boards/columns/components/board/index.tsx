// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import Loading from "@components/ui/loading";
// import { createOrUpdateColumnsBoardProjectManagement } from "@services/projectManagement/fetch";
// import { useGetColumns } from "@services/projectManagement/hooks";
// import { IColumns } from "@services/setup/types";
// import { ReactSortable } from "react-sortablejs";
// import { cn } from "src/core/utils/components";

// import SaveButton, { ChooseBoardButton } from "../saveButton";
// import styles from "./styles.module.css";

// export default function Board(): React.ReactNode {
//     const { replace } = useRouter();
//     const [columnsDefault, setColumnsDefault] = React.useState<IColumns[]>([]);
//     const [todo, setTodo] = React.useState<IColumns[]>([]);
//     const [wip, setWip] = React.useState<IColumns[]>([]);
//     const [done, setDone] = React.useState<IColumns[]>([]);
//     const [isError, setIsError] = React.useState<boolean>(false);
//     const [disabled, setDisabled] = React.useState<boolean>(false);

//     const { data: projectManagementColumns, isLoading } = useGetColumns();

//     React.useEffect(() => {
//         async function forToSetColumns(columns: IColumns[]) {
//             for (const column of columns) {
//                 switchToSetColumns(column);
//             }
//         }

//         setColumnsDefault([]);
//         setTodo([]);
//         setWip([]);
//         setDone([]);

//         if (projectManagementColumns) {
//             forToSetColumns(projectManagementColumns?.columns);
//         }
//     }, [projectManagementColumns]);

//     async function switchToSetColumns(column: IColumns) {
//         switch (column.column) {
//             case "todo":
//                 setTodo((prevColumns) => [...prevColumns, column]);
//                 break;
//             case "wip":
//                 setWip((prevColumns) => [...prevColumns, column]);
//                 break;
//             case "done":
//                 setDone((prevColumns) => [...prevColumns, column]);
//                 break;

//             default:
//                 setColumnsDefault((prevColumns) => [...prevColumns, column]);
//                 break;
//         }
//     }

//     async function formattedColumnsToSave(
//         key: "todo" | "wip" | "done",
//         columns: { name: string; id: string; order?: number }[],
//     ) {
//         return columns?.map((column) => {
//             return {
//                 name: column.name,
//                 id: column.id,
//                 column: key,
//                 order: column.order,
//             };
//         });
//     }

//     async function createOrUpdateColumns() {
//         try {
//             const [todoFormatted, wipFormatted, doneFormatted] =
//                 await Promise.all([
//                     formattedColumnsToSave("todo", todo),
//                     formattedColumnsToSave("wip", wip),
//                     formattedColumnsToSave("done", done),
//                 ]);

//             if (
//                 todoFormatted.length === 0 ||
//                 wipFormatted.length === 0 ||
//                 doneFormatted.length === 0
//             ) {
//                 setIsError(true);
//                 return;
//             }

//             const columnsToFetch = [
//                 ...todoFormatted,
//                 ...wipFormatted,
//                 ...doneFormatted,
//             ];

//             setDisabled(true);

//             await createOrUpdateColumnsBoardProjectManagement(columnsToFetch);
//             replace("/setup");
//         } catch (error) {}
//     }

//     return (
//         <div className="flex w-full flex-col items-center lg:w-[80%] xl:w-[70%]">
//             <div className={styles.headerContainer}>
//                 <div className={styles.headerTopContainer}>
//                     <span className="text-[16px] font-medium text-[#C1C1C1]">
//                         NOTES
//                     </span>

//                     <span>
//                         The colors represent the categories (
//                         {/*
//                          */}
//                         <span className="font-semibold text-[#9B84CD]">
//                             To do
//                         </span>
//                         ,{" "}
//                         <span className="font-semibold text-[#1E8AFF]">
//                             WIP
//                         </span>
//                         ,{" "}
//                         <span className="font-semibold text-[#19C26F]">
//                             Done
//                         </span>
//                         {/*
//                          */}
//                         ) configured in your project management tool.
//                     </span>

//                     <span>
//                         <span className="font-semibold text-[#9B84CD]">
//                             To Do
//                         </span>
//                         {/*
//                          */}
//                         : Add the status where tasks are queued for development.
//                     </span>

//                     <span>
//                         <span className="font-semibold text-[#1E8AFF]">
//                             Work In Progress (WIP)
//                         </span>
//                         : Include all statuses representing ongoing work between{" "}
//                         <span className="italic">To Do</span> and{" "}
//                         <span className="italic">Done</span>.
//                     </span>

//                     <span>
//                         <span className="font-semibold text-[#19C26F]">
//                             Done
//                         </span>
//                         {/*
//                          */}
//                         : Designate the final status where tasks are considered
//                         completed.
//                     </span>

//                     <span>
//                         Please ensure that the status matches your development
//                         flow.{" "}
//                         <span className="font-semibold text-[#C1C1C1]">
//                             Incorrect setup can lead to inaccurate metrics and
//                             insights.
//                         </span>{" "}
//                         Some items are pre-loaded to guide you.
//                     </span>
//                 </div>
//                 <div className={styles.columnsContainer}>
//                     <span className={styles.columnsHeaderText}>
//                         Drag and drop the statuses to the workflow:
//                     </span>
//                     <ReactSortable
//                         className={styles.columns}
//                         group="shared"
//                         list={columnsDefault}
//                         setList={setColumnsDefault}>
//                         {isLoading ? (
//                             <div className="flex w-full justify-center">
//                                 <div className="scale-75">
//                                     <Loading />
//                                 </div>
//                             </div>
//                         ) : (
//                             columnsDefault?.map((item) => (
//                                 <div
//                                     className={cn(
//                                         styles.button,
//                                         styles.buttonBackground,
//                                     )}
//                                     key={item.id}>
//                                     {item.name}
//                                 </div>
//                             ))
//                         )}
//                     </ReactSortable>
//                 </div>
//             </div>
//             <div className={styles.boardRoot}>
//                 <div className={styles.cardContainer}>
//                     <div className={cn(styles.cardHeader, "bg-[#6A57A433]")}>
//                         To do
//                     </div>
//                     <ReactSortable
//                         id="todo"
//                         group="shared"
//                         list={todo}
//                         className={styles.card}
//                         setList={setTodo}>
//                         {todo.map((item) => (
//                             <div
//                                 className={cn(styles.button, "bg-[#6A57A433]!")}
//                                 key={item.id}>
//                                 {item.name}
//                             </div>
//                         ))}
//                     </ReactSortable>
//                 </div>
//                 <div className={styles.cardContainer}>
//                     <div className={cn(styles.cardHeader, "bg-[#1E8AFF33]")}>
//                         Work in progress
//                     </div>
//                     <ReactSortable
//                         id="wip"
//                         group="shared"
//                         list={wip}
//                         className={styles.card}
//                         setList={(data) => {
//                             const wipFormatted = data.map((column, index) => {
//                                 return {
//                                     ...column,
//                                     order: index + 1,
//                                     wipName: `${index + 1}. ${column.name}`,
//                                 };
//                             });
//                             setWip(wipFormatted);
//                         }}>
//                         {wip.map((item) => (
//                             <div
//                                 className={cn(styles.button, "bg-[#1E8AFF33]!")}
//                                 key={item.id}>
//                                 {item.wipName}
//                             </div>
//                         ))}
//                     </ReactSortable>
//                 </div>
//                 <div className={styles.cardContainer}>
//                     <div className={cn(styles.cardHeader, "bg-[#19C26F33]")}>
//                         Done
//                     </div>
//                     <ReactSortable
//                         id="done"
//                         group="shared"
//                         className={styles.card}
//                         list={done}
//                         setList={setDone}>
//                         {done.map((item) => (
//                             <div
//                                 className={cn(styles.button, "bg-[#19C26F33]!")}
//                                 key={item.id}>
//                                 {item.name}
//                             </div>
//                         ))}
//                     </ReactSortable>
//                 </div>
//             </div>
//             <div className="mt-16 flex w-full items-center gap-4 md:w-max">
//                 <ChooseBoardButton />
//                 <SaveButton
//                     isDisabled={disabled}
//                     createOrUpdateColumns={createOrUpdateColumns}
//                 />
//             </div>
//             <div
//                 hidden={!isError}
//                 className={"mt-1 list-disc text-[14px] text-red-500"}>
//                 <li>Select at least one column for each status.</li>
//             </div>
//         </div>
//     );
// }
