import { Schema, model } from "mongoose";
import { CommandAccess } from "../CommandAccess";

const customCommandSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    access: {
        type: Number,
        enum: CommandAccess
    },
    outputs: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export const CustomCommand = model("Custom Command", customCommandSchema);