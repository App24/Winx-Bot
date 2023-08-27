import { Document, InferSchemaType } from "mongoose";

export class DocumentWrapper<TSchema = any>{
    public document: Document<unknown, Record<string, unknown>, TSchema> & TSchema;

    public constructor(document: Document<unknown, Record<string, unknown>, TSchema> & TSchema) {
        this.document = document;
    }

    public save() {
        if (!this.isNull())
            return this.document.save();
    }

    public toObject() {
        if (!this.isNull()) return this.document.toObject();
        return undefined;
    }

    public set(path: string | Record<string, any>, val: any) {
        if (!this.isNull())
            this.document.set(path, val);
        return this;
    }

    public isNull() {
        if (this.document) return false;
        return true;
    }
}

export class ModelWrapper<TSchema = any> extends DocumentWrapper<InferSchemaType<TSchema>>{

}