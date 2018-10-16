import {UserAction} from "./userAction";

export interface User {
    firstName: string;
    lastName: string;
    gender: string;
    login: string;
    password: string;
    avatar: string;
    action: UserAction;
    id: number;
}