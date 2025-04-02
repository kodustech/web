import * as React from "react";
import { SVGProps } from "react";

export const SvgJira = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}>
        <path
            d="M24.624 50C29.4657 45.1583 29.4995 37.295 24.701 32.4965L16.6376 24.4331L24.701 15.9091C24.701 15.9091 28.952 11.7898 28.952 8.23864C28.952 2.13069 24.6241 8.00775e-06 24.6241 8.00775e-06L0.592657 23.0542C-0.160653 23.8075 -0.212479 25.0695 0.532997 25.8149L24.624 50Z"
            fill="url(#paint0_linear_190_41)"
        />
        <path
            d="M24.7825 0C19.9408 4.84167 19.907 12.705 24.7055 17.5035L32.769 25.5669L24.7055 34.0909C24.7055 34.0909 20.4545 38.2102 20.4545 41.7614C20.4545 47.8693 24.7825 50 24.7825 50L48.8139 26.9458C49.5672 26.1925 49.619 24.9305 48.8735 24.1851L24.7825 0Z"
            fill="url(#paint1_linear_190_41)"
        />
        <path
            d="M24.701 32.4965C29.4995 37.295 29.4657 45.1583 24.624 50L0.532991 25.8149L16.6375 24.4331L24.701 32.4965Z"
            fill="#2684FF"
        />
        <defs>
            <linearGradient
                id="paint0_linear_190_41"
                x1="33.1115"
                y1="20.1643"
                x2="20.8328"
                y2="28.418"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.15" stopColor="#0052CC" />
                <stop offset="0.503" stopColor="#0E64DE" />
                <stop offset="1" stopColor="#2684FF" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_190_41"
                x1="16.295"
                y1="29.8357"
                x2="28.5737"
                y2="21.582"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.15" stopColor="#0052CC" />
                <stop offset="0.503" stopColor="#0E64DE" />
                <stop offset="1" stopColor="#2684FF" />
            </linearGradient>
        </defs>
    </svg>
);
