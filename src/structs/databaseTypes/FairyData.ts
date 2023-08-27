import { Schema, model } from "mongoose";

const fairyDataSchema = new Schema({
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
    },
    name: String,
    bodyBaseId: String,
    hairId: String,
    eyesId: String,
    noseId: String,
    lipsId: String,
    shirtId: String,
    glovesId: String,
    skirtId: String,
    bootsId: String,
    wingsId: String
});

export const FairyData = model("Fairy Data", fairyDataSchema);