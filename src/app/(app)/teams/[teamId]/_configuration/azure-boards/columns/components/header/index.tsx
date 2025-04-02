"use client";

import { useRouter } from "next/navigation";
import { SvgArrow } from "@components/ui/icons/SvgArrow";

import styles from "./styles.module.css";

export default function Header() {
    const router = useRouter();

    return (
        <div className={styles.header}>
            <div className="flex items-center gap-4">
                <div
                    className={styles.backButton}
                    onClick={() => router.push("/setup")}>
                    <SvgArrow width={30} />
                </div>
                <span className={styles.title}>Boards Setup</span>
            </div>
            <div className={styles.subTitle}>
                Let us know which project board columns relate to the following
                workflow to understand your process better.
            </div>
        </div>
    );
}
