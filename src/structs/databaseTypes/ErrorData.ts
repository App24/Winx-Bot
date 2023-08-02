import { Schema, model } from "mongoose";

const errorDataSchema = new Schema({
    errorId: {
        type: String,
        required: true
    },
    error: String
}, { timestamps: true });

export const ErrorData = model("Error Data", errorDataSchema);