export interface IClientUser {
    firstName: string;
    lastName: string;
    gender: string;
    login: string;
    avatar: string;
    action: object;
    id: string;
    online: boolean;
    lastSeen: Date;
}
export class ClientUser {
    firstName: string;
    lastName: string;
    gender: string;
    login: string;
    avatar: string;
    action: object;
    id: string;
    online: boolean;
    lastSeen: Date;

    constructor(options: IClientUser) {
        this.firstName = options.firstName;
        this.lastName = options.lastName;
        this.gender = options.gender;
        this.login = options.login;
        this.avatar = options.avatar;
        this.action = options.action;
        this.id = options.id;
        this.online = options.online;
        this.lastSeen = options.lastSeen;
    }
}