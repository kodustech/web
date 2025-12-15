import * as React from "react";
import { SVGProps } from "react";

export const SvgPerplexity = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="42"
        height="42"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}>
        <path
            d="M40 7.5V72.5M22.883 27.622V10.972L40 27.622m0 0-17.117 17.395V69.03L40 51.788m0-24.166L57.117 10.972V27.622M22.883 52.327h-7.15V27.622h48.534v24.705h-7.15M40 27.622 57.117 45.017v24.011L40 51.788"
            stroke="currentColor"
            strokeWidth={1.667}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
