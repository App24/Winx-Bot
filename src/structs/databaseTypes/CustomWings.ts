import { Schema, model } from "mongoose";

const customWingsSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    wingsFile: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const CustomWings = model("Custom Wings", customWingsSchema);