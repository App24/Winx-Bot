import { Schema, model } from "mongoose";

const wingsRequestSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    wingsFile: String
}, { timestamps: true });

export const WingsRequest = model("Wings Request", wingsRequestSchema);

export interface WingsRequestData {
    userId: string,
    guildId: string,
    wingsFile: string
}