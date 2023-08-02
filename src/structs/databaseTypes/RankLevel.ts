import { Schema, model } from "mongoose";

const wingsDataSchema = new Schema({
    aisha: String,
    stella: String,
    bloom: String,
    tecna: String,
    musa: String,
    flora: String
});

const rankLevelSchema = new Schema({
    roleId: {
        type: String
    },
    guildId: {
        type: String,
        required: true
    },
    level: {
        type: Number
    },
    gifs: [String],
    wings: {
        type: wingsDataSchema,
        default: {
            aisha: "",
            stella: "",
            bloom: "",
            tecna: "",
            musa: "",
            flora: "",
        }
    }
}, { timestamps: true });

export const RankLevel = model("Rank Level", rankLevelSchema);

export interface RankLevelData {
    guildId: string,
    roleId: string,
    level: number,
    gifs: string[],
    wings: WingsData
}

export interface WingsData {
    aisha: string,
    stella: string,
    bloom: string,
    tecna: string,
    musa: string,
    flora: string
}

export const DEFAULT_WINGS_DATA: WingsData = {
    aisha: "",
    stella: "",
    bloom: "",
    tecna: "",
    musa: "",
    flora: ""
};