import { WinxCharacter } from "../WinxCharacters";

export class ServerUserSettings {
    public userId: string;
    public wingsLevel: number;
    public wingsLevelB: number;
    public levelPing: boolean;
    // public cardName: "DISABLED" | "USERNAME" | "NICKNAME";
    public animatedCard: boolean;
    // public wingsTemplate: CardTemplate;
    // public cardTemplate: CardTemplate;
    // public cardWings: "ENABLED" | "CUSTOM";

    // public barStartColor: string;
    // public barEndColor: string;
    // public cardColor: string;
    // public cardColorB: string;
    // public nameColor: string;
    // public specialCircleColor: string;

    public winxCharacter: WinxCharacter;
    public winxCharacterB: WinxCharacter;

    public cardCode: string;

    public cardSlots: CardSlot[];

    public constructor(id: string) {
        this.userId = id;
        this.wingsLevel = -1;
        this.wingsLevelB = -1;
        this.levelPing = false;
        // this.cardName = "NICKNAME";
        // this.cardWings = "ENABLED";
        this.animatedCard = true;
        // this.wingsTemplate = CardTemplate.Normal;
        // this.cardColor = CardTemplate.Normal;
        // this.cardColor = "363636";
        // this.cardColorB = "363636";
        // this.barStartColor = "cc0000";
        // this.barEndColor = "44cc00";
        // this.nameColor = "none";
        // this.specialCircleColor = "none";
        this.winxCharacter = WinxCharacter.None;
        this.winxCharacterB = WinxCharacter.None;
        this.cardCode = DEFAULT_CARD_CODE;
        this.cardSlots = [];
    }
}

export interface CardSlot {
    name: string,
    code: string,
    customWings: string
}

export enum CardTemplate {
    Normal = "normal",
    Split = "split",
    Gradient = "gradient",
    Central_Gradient = "centralGradient",
    Radial_Gradient = "radialGradient"
}

export const DEFAULT_CARD_CODE = "background_primaryColor=#363636|background_secondaryColor=#363636|background_template=normal|background_round=1|name_matchRole=true|name_type=nickname|name_positionX=600|name_positionY=5|name_textFont=Comic Sans MS|name_textAlign=center|name_textBaseline=top|name_textSize=1|name_strokeColor=#000000|name_strokeSize=3|pfp_size=1|pfp_positionX=600|pfp_positionY=260|pfpCircle_width=10|pfpCircle_color=#000000|wings_followPfp=true|wings_template=normal|wings_autoSizeWingsA=true|wings_autoSizeWingsB=true|levels_positionX=10|levels_positionY=5|levels_textFont=Comic Sans MS|levels_textAlign=left|levels_textBaseline=top|levels_textColor=#ffffff|levels_textSize=1|levels_strokeColor=#000000|levels_strokeSize=0|xp_middleLevel=true|xp_autoOffset=true|xp_textFont=Comic Sans MS|xp_textAlign=center|xp_textBaseline=top|xp_textColor=#ffffff|xp_textSize=1|xp_strokeColor=#000000|xp_strokeSize=0|xpBar_type=circle|xpBar_startColor=#cc0000|xpBar_endColor=#44cc00|xpBar_width=10|rank_positionX=1190|rank_positionY=5|rank_textFont=Comic Sans MS|rank_textAlign=right|rank_textBaseline=top|rank_textColor=#ffffff|rank_textSize=1|rank_strokeColor=#000000|rank_strokeSize=0|currentTransformation_positionX=600|currentTransformation_positionY=500|currentTransformation_textFont=Comic Sans MS|currentTransformation_textAlign=center|currentTransformation_textBaseline=bottom|currentTransformation_textColor=#ffffff|currentTransformation_strokeColor=#000000|currentTransformation_strokeSize=0|nextTransformation_positionX=600|nextTransformation_positionY=600|nextTransformation_textFont=Comic Sans MS|nextTransformation_textAlign=center|nextTransformation_textBaseline=bottom|nextTransformation_textColor=#ffffff|nextTransformation_strokeColor=#000000|nextTransformation_strokeSize=0|lb_backgroundColorType=primaryColor|lb_nameType=tag|cl_background=0|cl_name=2|cl_pfp=5|cl_pfpCircle=2|cl_wings=1|cl_levels=4|cl_xp=4|cl_xpBar=3|cl_rank=4|cl_currentTransformation=4|cl_nextTransformation=4";