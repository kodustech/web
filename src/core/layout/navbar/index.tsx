"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@components/ui/navigation-menu";
import { UserNav } from "src/core/layout/navbar/_components/user-nav";
import { useAuth } from "src/core/providers/auth.provider";
import { cn } from "src/core/utils/components";
import { SubscriptionBadge } from "src/features/ee/subscription/_components/subscription-badge";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { SupportDropdown } from "./_components/support";

export const NavMenu = () => {
    const pathname = usePathname();
    const { isOwner, isTeamLeader } = useAuth();
    const subscription = useSubscriptionStatus();

    const items = useMemo<
        Array<{
            label: string;
            icon: React.JSX.Element;
            href: string;
            visible: boolean;
        }>
    >(() => {
        return [
            // {
            //     label: "Chat",
            //     icon: <MessageSquareText size={16} />,
            //     href: "/chat",
            //     visible: true,
            // },
            {
                label: "Cockpit",
                href: "/cockpit",
                visible: subscription.valid,
                icon: (
                    <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="currentColor"
                            d="M18.4978 7.53125C18.0586 6.49162 17.4218 5.54708 16.6228 4.75C15.8257 3.95099 14.8812 3.31423 13.8416 2.875C12.7615 2.41797 11.6169 2.1875 10.4353 2.1875C9.25366 2.1875 8.10913 2.41797 7.02905 2.875C5.98942 3.31423 5.04489 3.95099 4.2478 4.75C3.4488 5.54708 2.81203 6.49162 2.3728 7.53125C1.91577 8.61133 1.6853 9.75586 1.6853 10.9375C1.6853 13.5293 2.82397 15.9707 4.80835 17.6387L4.84155 17.666C4.95483 17.7598 5.09741 17.8125 5.2439 17.8125H15.6287C15.7751 17.8125 15.9177 17.7598 16.031 17.666L16.0642 17.6387C18.0466 15.9707 19.1853 13.5293 19.1853 10.9375C19.1853 9.75586 18.9529 8.61133 18.4978 7.53125ZM15.3064 16.3281H5.56421C4.80951 15.6476 4.20633 14.8161 3.79381 13.8874C3.38129 12.9587 3.16865 11.9537 3.16968 10.9375C3.16968 8.99609 3.92554 7.17188 5.29858 5.80078C6.67163 4.42773 8.49585 3.67188 10.4353 3.67188C12.3767 3.67188 14.2009 4.42773 15.572 5.80078C16.9451 7.17383 17.7009 8.99805 17.7009 10.9375C17.7009 13 16.8318 14.9512 15.3064 16.3281ZM12.613 8.23242C12.5837 8.20334 12.544 8.18703 12.5027 8.18703C12.4614 8.18703 12.4217 8.20334 12.3923 8.23242L10.7419 9.88281C10.3767 9.78516 9.97241 9.87891 9.6853 10.166C9.58361 10.2675 9.50293 10.3881 9.44789 10.5208C9.39284 10.6535 9.36451 10.7958 9.36451 10.9395C9.36451 11.0831 9.39284 11.2254 9.44789 11.3581C9.50293 11.4908 9.58361 11.6114 9.6853 11.7129C9.7868 11.8146 9.90736 11.8953 10.0401 11.9503C10.1728 12.0054 10.3151 12.0337 10.4587 12.0337C10.6024 12.0337 10.7447 12.0054 10.8774 11.9503C11.0101 11.8953 11.1307 11.8146 11.2322 11.7129C11.3682 11.5773 11.466 11.4082 11.5157 11.2226C11.5655 11.0371 11.5653 10.8417 11.5154 10.6562L13.1658 9.00586C13.2263 8.94531 13.2263 8.8457 13.1658 8.78516L12.613 8.23242ZM10.0056 6.25H10.865C10.9509 6.25 11.0212 6.17969 11.0212 6.09375V4.53125C11.0212 4.44531 10.9509 4.375 10.865 4.375H10.0056C9.91968 4.375 9.84937 4.44531 9.84937 4.53125V6.09375C9.84937 6.17969 9.91968 6.25 10.0056 6.25ZM15.0837 10.5078V11.3672C15.0837 11.4531 15.1541 11.5234 15.24 11.5234H16.8025C16.8884 11.5234 16.9587 11.4531 16.9587 11.3672V10.5078C16.9587 10.4219 16.8884 10.3516 16.8025 10.3516H15.24C15.1541 10.3516 15.0837 10.4219 15.0837 10.5078ZM15.3318 6.65625L14.7244 6.04883C14.695 6.01975 14.6553 6.00344 14.614 6.00344C14.5727 6.00344 14.533 6.01975 14.5037 6.04883L13.3982 7.1543C13.3691 7.18366 13.3528 7.22332 13.3528 7.26465C13.3528 7.30598 13.3691 7.34563 13.3982 7.375L14.0056 7.98242C14.0662 8.04297 14.1658 8.04297 14.2263 7.98242L15.3318 6.87695C15.3923 6.81641 15.3923 6.7168 15.3318 6.65625ZM6.37476 6.04883C6.34539 6.01975 6.30573 6.00344 6.2644 6.00344C6.22308 6.00344 6.18342 6.01975 6.15405 6.04883L5.54663 6.65625C5.51755 6.68562 5.50124 6.72527 5.50124 6.7666C5.50124 6.80793 5.51755 6.84759 5.54663 6.87695L6.6521 7.98242C6.71265 8.04297 6.81226 8.04297 6.8728 7.98242L7.48022 7.375C7.54077 7.31445 7.54077 7.21484 7.48022 7.1543L6.37476 6.04883ZM5.55249 10.3516H3.98999C3.90405 10.3516 3.83374 10.4219 3.83374 10.5078V11.3672C3.83374 11.4531 3.90405 11.5234 3.98999 11.5234H5.55249C5.63843 11.5234 5.70874 11.4531 5.70874 11.3672V10.5078C5.70874 10.4219 5.63843 10.3516 5.55249 10.3516Z"
                        />
                    </svg>
                ),
            },

            {
                label: "Code Review Settings",
                icon: (
                    <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.7686 12.5C14.857 12.5 15.7836 13.1958 16.127 14.1667H17.102C17.323 14.1667 17.5349 14.2545 17.6912 14.4107C17.8475 14.567 17.9353 14.779 17.9353 15C17.9353 15.221 17.8475 15.433 17.6912 15.5893C17.5349 15.7455 17.323 15.8333 17.102 15.8333H16.127C15.9548 16.3213 15.6355 16.7438 15.2131 17.0427C14.7908 17.3415 14.2861 17.502 13.7686 17.502C13.2512 17.502 12.7465 17.3415 12.3241 17.0427C11.9018 16.7438 11.5825 16.3213 11.4103 15.8333H3.76864C3.54762 15.8333 3.33566 15.7455 3.17938 15.5893C3.0231 15.433 2.9353 15.221 2.9353 15C2.9353 14.779 3.0231 14.567 3.17938 14.4107C3.33566 14.2545 3.54762 14.1667 3.76864 14.1667H11.4103C11.5827 13.679 11.9021 13.2569 12.3245 12.9584C12.7469 12.6599 13.2514 12.4997 13.7686 12.5ZM13.7686 14.1667C13.5476 14.1667 13.3357 14.2545 13.1794 14.4107C13.0231 14.567 12.9353 14.779 12.9353 15C12.9353 15.221 13.0231 15.433 13.1794 15.5893C13.3357 15.7455 13.5476 15.8333 13.7686 15.8333C13.9896 15.8333 14.2016 15.7455 14.3579 15.5893C14.5142 15.433 14.602 15.221 14.602 15C14.602 14.779 14.5142 14.567 14.3579 14.4107C14.2016 14.2545 13.9896 14.1667 13.7686 14.1667ZM7.10197 7.5C7.59279 7.49993 8.07278 7.64435 8.48208 7.91524C8.89138 8.18613 9.21189 8.57151 9.40364 9.02333L9.45947 9.16667H17.102C17.3144 9.1669 17.5187 9.24823 17.6731 9.39404C17.8276 9.53985 17.9205 9.73913 17.9329 9.95116C17.9454 10.1632 17.8764 10.372 17.7401 10.5349C17.6038 10.6977 17.4104 10.8024 17.1995 10.8275L17.102 10.8333H9.4603C9.2923 11.3086 8.98461 11.722 8.57758 12.0193C8.17055 12.3166 7.68317 12.484 7.17935 12.4995C6.67552 12.515 6.17878 12.3779 5.75424 12.1061C5.32971 11.8344 4.99719 11.4407 4.8003 10.9767L4.74364 10.8333H3.76864C3.55624 10.8331 3.35194 10.7518 3.1975 10.606C3.04305 10.4602 2.95011 10.2609 2.93766 10.0488C2.92521 9.8368 2.9942 9.62802 3.13052 9.46514C3.26685 9.30226 3.46022 9.19759 3.67114 9.1725L3.76864 9.16667H4.74364C4.91604 8.67904 5.23544 8.25688 5.65782 7.95838C6.0802 7.65988 6.58476 7.49973 7.10197 7.5ZM7.10197 9.16667C6.88096 9.16667 6.66899 9.25446 6.51271 9.41074C6.35643 9.56703 6.26864 9.77899 6.26864 10C6.26864 10.221 6.35643 10.433 6.51271 10.5893C6.66899 10.7455 6.88096 10.8333 7.10197 10.8333C7.32298 10.8333 7.53494 10.7455 7.69122 10.5893C7.84751 10.433 7.9353 10.221 7.9353 10C7.9353 9.77899 7.84751 9.56703 7.69122 9.41074C7.53494 9.25446 7.32298 9.16667 7.10197 9.16667ZM13.7686 2.5C14.857 2.5 15.7836 3.19583 16.127 4.16667H17.102C17.323 4.16667 17.5349 4.25446 17.6912 4.41075C17.8475 4.56703 17.9353 4.77899 17.9353 5C17.9353 5.22101 17.8475 5.43298 17.6912 5.58926C17.5349 5.74554 17.323 5.83333 17.102 5.83333H16.127C15.9548 6.32128 15.6355 6.74381 15.2131 7.04268C14.7908 7.34155 14.2861 7.50204 13.7686 7.50204C13.2512 7.50204 12.7465 7.34155 12.3241 7.04268C11.9018 6.74381 11.5825 6.32128 11.4103 5.83333H3.76864C3.54762 5.83333 3.33566 5.74554 3.17938 5.58926C3.0231 5.43298 2.9353 5.22101 2.9353 5C2.9353 4.77899 3.0231 4.56703 3.17938 4.41075C3.33566 4.25446 3.54762 4.16667 3.76864 4.16667H11.4103C11.5827 3.67904 11.9021 3.25688 12.3245 2.95838C12.7469 2.65988 13.2514 2.49973 13.7686 2.5ZM13.7686 4.16667C13.5476 4.16667 13.3357 4.25446 13.1794 4.41075C13.0231 4.56703 12.9353 4.77899 12.9353 5C12.9353 5.22101 13.0231 5.43298 13.1794 5.58926C13.3357 5.74554 13.5476 5.83333 13.7686 5.83333C13.9896 5.83333 14.2016 5.74554 14.3579 5.58926C14.5142 5.43298 14.602 5.22101 14.602 5C14.602 4.77899 14.5142 4.56703 14.3579 4.41075C14.2016 4.25446 13.9896 4.16667 13.7686 4.16667Z"
                        />
                    </svg>
                ),
                href: "/settings",
                visible: isOwner || isTeamLeader,
            },
        ];
    }, [isOwner, isTeamLeader]);

    const isActive = (route: string) => pathname.startsWith(route);

    return (
        <div className="z-50 flex h-16 flex-shrink-0 items-center gap-8 border-b px-6">
            <Link href="/">
                <SvgKodus className="h-8 max-w-max" />
            </Link>

            <div className="flex-1">
                <NavigationMenu>
                    <NavigationMenuList>
                        {items.map(({ label, icon, href, visible }) => {
                            if (!visible) return null;

                            return (
                                <NavigationMenuItem key={label}>
                                    <NavigationMenuLink
                                        href={href}
                                        className={cn(
                                            "relative flex flex-row items-center gap-2 text-white",
                                            "text-sm transition-colors focus-visible:text-opacity-100 hover:text-opacity-100",

                                            isActive(href)
                                                ? "text-opacity-100"
                                                : "text-opacity-50",
                                        )}>
                                        <span>{icon}</span>
                                        {label}

                                        {href === "/chat" && (
                                            <div className="absolute -right-4 -top-4 z-10 text-[10px] text-brand-red">
                                                Alpha
                                            </div>
                                        )}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="flex items-center gap-4">
                <SubscriptionBadge />

                <SupportDropdown />

                <Suspense>
                    <UserNav />
                </Suspense>
            </div>
        </div>
    );
};
