import { HydratedDocument, InferSchemaType, ObtainSchemaGeneric, Schema, model } from "mongoose";
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

export type CustomCommandDocumentType = HydratedDocument<
    InferSchemaType<typeof customCommandSchema>,
    ObtainSchemaGeneric<typeof customCommandSchema, 'TVirtuals'> & ObtainSchemaGeneric<typeof customCommandSchema, 'TInstanceMethods'>,
    ObtainSchemaGeneric<typeof customCommandSchema, 'TQueryHelpers'>
>;