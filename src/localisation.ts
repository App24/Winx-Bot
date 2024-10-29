import { existsSync, readFileSync } from "fs";
import { formatString } from "./utils/FormatUtils";
import { LocalisationKeys } from "./structs/LocalKeys";

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

    public getLocalisation(localisationData: LocalisationType) {
        const key = localisationData.key;
        let args = localisationData.args;
        if (!args) args = [];
        const toReturn = this.localisation[key];
        if (!toReturn) {
            console.log(`Couldn't find translation for key: '${key}'`);
            return key;
        }
        return formatString(toReturn, ...args);
    }

    public hasLocalisation(key:LocalisationKeys){
        return this.localisation[key] !== undefined;
    }
}

export class LocalisationType {
    key: LocalisationKeys | string;
    args?: any[];
}

export const Localisation = new Language();