import { Schema, model } from "mongoose";

const serverDataSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    maxMessagePerMinute: {
        type: Number,
        default: 50
    },
    maxXpPerMessage: {
        type: Number,
        default: 5
    },
    minMessageLength: {
        type: Number,
        default: 3
    },
    maxMessageLength: {
        type: Number,
        default: 20
    },
    levelChannel: String,
    excludeChannels: {
        type: [String],
        default: []
    },
    wingsRequestChannel: String,
    weeklyLeaderboardAnnouncementChannel: String
}, { timestamps: true });

export const ServerData = model("Server Data", serverDataSchema);