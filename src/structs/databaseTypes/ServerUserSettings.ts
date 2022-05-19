import { WinxCharacter } from "../WinxCharacters";

export class ServerUserSettings {
    public userId: string;
    public wingsLevel: number;
    public wingsLevelB: number;
    public levelPing: boolean;
    public cardName: "DISABLED" | "USERNAME" | "NICKNAME";
    public animatedCard: boolean;
    public wingsTemplate: CardTemplate;
    public cardTemplate: CardTemplate;
    public cardWings: "ENABLED" | "CUSTOM";

    public barStartColor: string;
    public barEndColor: string;
    public cardColor: string;
    public cardColorB: string;
    public nameColor: string;
    public specialCircleColor: string;

    public winxCharacter: WinxCharacter;
    public winxCharacterB: WinxCharacter;

    public constructor(id: string) {
        this.userId = id;
        this.wingsLevel = -1;
        this.wingsLevelB = -1;
        this.levelPing = false;
        this.cardName = "NICKNAME";
        this.cardWings = "ENABLED";
        this.animatedCard = true;
        this.wingsTemplate = CardTemplate.Normal;
        this.cardColor = CardTemplate.Normal;
        this.cardColor = "363636";
        this.cardColorB = "363636";
        this.barStartColor = "cc0000";
        this.barEndColor = "44cc00";
        this.nameColor = "none";
        this.specialCircleColor = "none";
        this.winxCharacter = WinxCharacter.None;
        this.winxCharacterB = WinxCharacter.None;
    }
}

export enum CardTemplate {
    Normal = "normal",
    Split = "split",
    Gradient = "gradient",
    Central_Gradient = "centralGradient",
    Radial_Gradient = "radialGradient"
}