import fs from "fs";
import { formatString } from "./utils/FormatUtils";

export class Localisation {
    private static localisation;

    public static clearLocalisation() {
        this.localisation = {};
    }

    public static loadLocalisation(file: string) {
        if (!fs.existsSync(file)) return;
        const jsonData: any = fs.readFileSync(file);
        const langData = JSON.parse(jsonData);
        for (const key in langData) {
            this.localisation[key] = langData[key];
        }
    }

    public static getTranslation(key: string, ...args) {
        const toReturn = this.localisation[key];
        if (!toReturn) {
            console.log(`Couldn't find translation for key: '${key}'`);
            return key;
        }
        return formatString(toReturn, ...args);
    }
}