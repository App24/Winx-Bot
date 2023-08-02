import { Schema, model } from "mongoose";
import { levelDataSchema } from "./LevelData";

const weeklyLeaderboardSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    levels: {
        type: [levelDataSchema],
        default: []
    },
    previousTop: {
        type: [String],
        default: []
    },
    topRoleId: String,
    startDate: Date
}, { timestamps: true });

export const WeeklyLeaderboard = model("Weekly Leaderboard", weeklyLeaderboardSchema);