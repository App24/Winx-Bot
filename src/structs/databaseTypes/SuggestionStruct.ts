import { Schema, model } from "mongoose";

export enum SuggestionState {
    Sent,
    Accepted,
    Rejected,
    Completed
}

const suggestionDataSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    request: String,
    state: {
        type: Number,
        enum: SuggestionState,
        default: SuggestionState.Sent
    }
}, { timestamps: true });

export const SuggestionData = model("Suggestion Data", suggestionDataSchema);