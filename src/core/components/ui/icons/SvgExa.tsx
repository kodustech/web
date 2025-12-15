import * as React from "react";
import { SVGProps } from "react";

export const SvgExa = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="42"
        height="42"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M125 0h791.667v74.625L578.833 500 916.667 925.375V1000H125V0Zm400.833 431.167L800.375 74.625H251.25l274.583 356.542ZM214.083 163.958v298.75h230L214.083 163.958Zm230 373.334h-230v298.75l230-298.75Zm-192.833 388.125L525.833 568.875 800.375 925.417H251.25Z"
            fill="currentColor"
        />
    </svg>
);
