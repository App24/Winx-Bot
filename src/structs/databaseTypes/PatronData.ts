import { Schema, model } from "mongoose";

const patronInfoSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    date: Date
}, { timestamps: true });

export const PatronData = model("Patron Data", patronInfoSchema);