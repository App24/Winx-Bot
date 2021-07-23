import fs from "fs";
import { formatString } from "./Utils";

export class Localisation{
    private static localisation;

    public static loadLocalisation(file : string){
        if(!fs.existsSync(file)) return;
        const jsonData:any=fs.readFileSync(file);
        const langData=JSON.parse(jsonData);
        this.localisation=langData;
    }

    public static getTranslation(key : string, ...args){
        let toReturn=this.localisation[key];
        if(!toReturn) return key;
        return formatString(toReturn, ...args);
    }
}