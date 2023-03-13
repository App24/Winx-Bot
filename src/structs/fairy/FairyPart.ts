import { existsSync, readFileSync } from "fs";
import path from "path";
import { FAIRY_PARTS_FOLDER, FAIRY_PARTS_IMAGES_FOLDER } from "../../Constants";
import { loadFiles } from "../../utils/Utils";

export class FairyPart {
    public readonly id: string;
    public readonly name: string;
    public readonly dataFile: string;
    public readonly imageFile: string;

    private constructor(id: string, name: string, dataFile: string, imageFile: string) {
        this.id = id;
        this.name = name;
        this.dataFile = path.join(FAIRY_PARTS_FOLDER, dataFile);
        this.imageFile = path.join(FAIRY_PARTS_IMAGES_FOLDER, imageFile);
    }

    public static from(file: string): FairyPart {
        const fileLocation = path.join(FAIRY_PARTS_FOLDER, file);

        if (!existsSync(fileLocation)) {
            return NULL_FAIRY_PART;
        }

        const data: any = readFileSync(fileLocation);

        const jsonData = JSON.parse(data);

        const parts = file.split("/");

        return new FairyPart(parts[parts.length - 1], jsonData["name"], file, jsonData["imageFile"]);
    }

    public static getAll(directory: string) {
        const targetDirectory = path.join(FAIRY_PARTS_FOLDER, directory);

        if (!existsSync(targetDirectory)) return [NULL_FAIRY_PART];

        const files = loadFiles(targetDirectory, ".json");

        if (!files || !files.length) return [NULL_FAIRY_PART];

        const parts: FairyPart[] = [];

        files.forEach(file => {
            const fileTarget = file.substring(FAIRY_PARTS_FOLDER.length + 1);
            parts.push(this.from(fileTarget));
        });

        return parts;
    }
}

export const NULL_FAIRY_PART = FairyPart.from("null.json");

export const BODY_BASE_PARTS = FairyPart.getAll("bodyBase");
export const HAIR_PARTS = FairyPart.getAll("hairParts");
export const UPPER_BODY_PARTS = FairyPart.getAll("upperBodyParts");
export const WINGS_PARTS = FairyPart.getAll("wingsParts");
export const LOWER_BODY_PARTS = FairyPart.getAll("lowerBodyParts");
export const BOOTS_PARTS = FairyPart.getAll("bootsParts");