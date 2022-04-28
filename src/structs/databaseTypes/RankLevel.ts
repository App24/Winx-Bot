export class RankLevel {
    public level: number;
    public roleId: string;
    public gifs: string[];
    public wings: WingsData;
    public constructor(level: number, roleId: string) {
        this.level = level;
        this.roleId = roleId;
        this.gifs = [];
        this.wings = DEFAULT_WINGS_DATA;
    }
}

export interface WingsData {
    aisha: string,
    stella: string,
    bloom: string,
    tecna: string,
    musa: string,
    flora: string
}

export const DEFAULT_WINGS_DATA = {
    aisha: "",
    stella: "",
    bloom: "",
    tecna: "",
    musa: "",
    flora: ""
};