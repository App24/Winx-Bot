import { existsSync, readFileSync } from "fs";
import path from "path";
import { FAIRY_PARTS_DATA_FOLDER, FAIRY_PARTS_IMAGES_FOLDER } from "../../Constants";
import { loadFiles } from "../../utils/Utils";

export enum FairyPartType {
    BodyBase,
    Hair,
    Eyes,
    Nose,
    Lips,
    Shirt,
    Gloves,
    Skirt,
    Boots,
    Wings
}

export class FairyPart {
    public readonly id: string;
    public readonly name: string;
    public readonly dataFile: string;
    public readonly imageFile: string;
    public readonly partType: FairyPartType;

    private constructor(id: string, name: string, dataFile: string, imageFile: string, partType: FairyPartType) {
        this.id = id;
        this.name = name;
        this.dataFile = path.join(FAIRY_PARTS_DATA_FOLDER, dataFile);
        this.imageFile = path.join(FAIRY_PARTS_IMAGES_FOLDER, imageFile);
        this.partType = partType;
    }

    public static getById(id: string): FairyPart {
        if (!PARTS.length) {
            this.loadAll();
        }

        return PARTS.find(p => p.id === id);
    }

    public static getByType(type: FairyPartType) {
        if (!PARTS.length) {
            this.loadAll();
        }

        return PARTS.filter(p => p.partType === type);
    }

    public static from(file: string) {
        const fileLocation = path.join(FAIRY_PARTS_DATA_FOLDER, file);

        if (!existsSync(fileLocation)) {
            return;
        }

        const data: any = readFileSync(fileLocation);

        const jsonData = JSON.parse(data);

        const parts = file.split("/");

        const name = parts[parts.length - 1].split(".")[0];

        return new FairyPart(name, jsonData["name"], file, parts[parts.length - 2] + "/" + (jsonData["imageFile"] ?? name) + ".png", jsonData["type"]);
    }

    private static loadAll() {
        const files = loadFiles(FAIRY_PARTS_DATA_FOLDER, ".json");

        if (!files || !files.length) return;

        files.forEach(file => {
            const fileTarget = file.substring(FAIRY_PARTS_DATA_FOLDER.length + 1);
            const part = this.from(fileTarget);
            if (part) PARTS.push(part);
        });
    }
}

export const PARTS: FairyPart[] = [];

/*export const BODY_BASE_PARTS = FairyPart.getAll("bodyBase");
export const EYES_PARTS = FairyPart.getAll("eyes");
export const HAIR_PARTS = FairyPart.getAll("hair");
export const LIPS_PARTS = FairyPart.getAll("lips");
export const NOSE_PARTS = FairyPart.getAll("nose");
export const SHIRT_PARTS = FairyPart.getAll("shirt");
export const GLOVES_PARTS = FairyPart.getAll("gloves");
export const SKIRT_PARTS = FairyPart.getAll("skirt");
export const BOOTS_PARTS = FairyPart.getAll("boots");*/