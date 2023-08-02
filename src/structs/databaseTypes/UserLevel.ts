import { Schema, model } from "mongoose";
import { levelDataSchema } from "./LevelData";



const userLevelSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    levelData: {
        type: levelDataSchema,
        default: {
            userId: "",
            level: 0,
            xp: 0
        }
    }
}, { timestamps: true });

export const UserLevel = model("User Level", userLevelSchema);