import * as React from "react";
import { SVGProps } from "react";

export const SvgArrow = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}>
        <path
            d="M5 16.25H20.2125L13.225 23.2375L15 25L25 15L15 5L13.2375 6.7625L20.2125 13.75H5V16.25Z"
            fill={props?.fill ?? "#C6BBE6"}
            fillOpacity={props?.fillOpacity ?? "0.4"}
        />
    </svg>
);
