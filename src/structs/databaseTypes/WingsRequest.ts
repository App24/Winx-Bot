export class WingsRequest {
    public userId: string;
    public wingsFile: string;

    public constructor(userId: string) {
        this.userId = userId;
        this.wingsFile = "";
    }
}