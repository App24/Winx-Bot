import { existsSync, readFileSync } from "fs";
import { formatString } from "./utils/FormatUtils";
import { LocalisationKeys } from "./structs/LocalKeys";

class Language {
    public getLocalisation(key: LocalisationKeys, ...args) {
        const toReturn = key;
        if (!toReturn) {
            console.log(`Couldn't find translation for key: '${key}'`);
            return key;
        }
        return formatString(toReturn, ...args);
    }
}

export const Localisation = new Language();