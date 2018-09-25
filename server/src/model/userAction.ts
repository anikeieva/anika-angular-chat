export class UserAction {
    signed: Boolean;
    edit: Boolean;
    joined: Boolean;
    sentMessage: Boolean;

    constructor(signed, edit, joined, sentMessage) {
        this.signed = signed;
        this.edit = edit;
        this.joined = joined;
        this.sentMessage = sentMessage;
    }
}
