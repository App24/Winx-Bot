import BotClient from "./BotClient";
import Discord from 'discord.js';
import { Category, Other } from "./Category";

abstract class Command{

    public guildOnly : boolean;
    public minArgsLength : number;
    public maxArgsLength : number;
    public paid : boolean;
    public description : string;
    public usage : string;
    public permissions : Array<string>;
    public deprecated : boolean;
    public cooldown : number;
    public creatorOnly : boolean;
    public guildOwnerOnly : boolean;
    public hidden : true;
    public aliases : Array<string>;
    public category : Category;
    public guildIds : string[];
    public enabled : boolean;

    public constructor(){
        this.minArgsLength=0;
        this.maxArgsLength=Number.MAX_SAFE_INTEGER;
        this.guildOnly=true;
        this.category=Other;
        this.enabled=true;
    }

    protected printTLArgsError(message : Discord.Message, num : number){
        message.reply(`You need ${num} arguments!`);
    }

    public abstract onRun(bot : BotClient, message : Discord.Message, args:Array<string>);
}

export = Command;