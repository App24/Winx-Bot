import { Schema } from "mongoose";

export const levelDataSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    }
});

export interface LevelData {
    userId: string,
    level: number,
    xp: number
}