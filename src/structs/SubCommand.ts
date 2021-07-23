import { Message } from "discord.js";
import { CommandArguments } from "./Command";

export abstract class SubCommand{

    public name : string;

    public minArgs : number;
    public maxArgs : number;

    public aliases : string[];

    public constructor(name : string){
        this.name=name;
        this.minArgs=0;
        this.maxArgs=Number.MAX_SAFE_INTEGER;
    }

    public abstract onRun(cmdArgs : CommandArguments);
}