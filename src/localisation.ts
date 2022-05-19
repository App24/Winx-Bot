import { existsSync, readFileSync } from "fs";
import { formatString } from "./utils/FormatUtils";

class Language {
    private localisation;

    public clearLocalisation() {
        this.localisation = {};
    }

    public loadLocalisation(file: string) {
        if (!existsSync(file)) return;
        const jsonData: any = readFileSync(file);
        const langData = JSON.parse(jsonData);
        for (const key in langData) {
            this.localisation[key] = langData[key];
        }
    }

    public getTranslation(key: string, ...args) {
        const toReturn = this.localisation[key];
        if (!toReturn) {
            console.log(`Couldn't find translation for key: '${key}'`);
            return key;
        }
        return formatString(toReturn, ...args);
    }
}

export const Localisation = new Language();