import { STATUS } from "@services/setup/types";

export enum UserRole {
    OWNER = "owner",
    USER = "user",
}

export interface IUser {
    uuid: string;
    password: string;
    email: string;
    status: STATUS;
    role: UserRole[];
}
