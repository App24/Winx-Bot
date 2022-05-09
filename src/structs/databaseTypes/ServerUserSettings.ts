export class ServerUserSettings {
    public userId: string;
    public wingsLevel: number;
    public levelPing: boolean;
    public cardName: "DISABLED" | "USERNAME" | "NICKNAME";
    public animatedCard: boolean;

    public constructor(id: string) {
        this.userId = id;
        this.wingsLevel = -1;
        this.levelPing = false;
        this.cardName = "NICKNAME";
        this.animatedCard = true;
    }
}