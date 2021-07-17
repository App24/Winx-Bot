import { Message } from "discord.js";
import { Localisation } from "../localisation";
import { asyncForEach } from "../Utils";
import { Category, Other } from "./Category";
import { SubCommand } from "./SubCommand";

export abstract class Command{
    public enabled : boolean;
    public deprecated : boolean;
    public hidden : boolean;

    public category : Category;

    public description : string;
    public usage : CommandUsage[];

    public availability : CommandAvailability;
    public access : CommandAccess;

    public aliases : string[];

    public minArgs : number;
    public maxArgs : number;

    public cooldown : number;

    public guildIds : string[];

    public subCommands : SubCommand[];

    public constructor(description? : string){
        this.description=description;
        this.enabled=true;
        this.category=Other;
        this.availability=CommandAvailability.Both;
        this.minArgs=0;
        this.maxArgs=Number.MAX_SAFE_INTEGER;
        this.subCommands=[];
    }

    protected async onRunSubCommands(message : Message, subCommandName : string, args : string[], showError:boolean=true){
        let found=false;
        await asyncForEach(this.subCommands, async(subCommand : SubCommand)=>{
            if(subCommand.name.toLowerCase()===subCommandName.toLowerCase()||(subCommand.aliases&&subCommand.aliases.includes(subCommandName.toLowerCase()))){
                if(args.length<subCommand.minArgs){
                    message.reply(Localisation.getTranslation("error.arguments.few"));
                }else if(args.length>subCommand.maxArgs){
                    message.reply(Localisation.getTranslation("error.arguments.many"));
                }else{
                    await subCommand.onRun(message, args);
                }
                found=true;
                return true;
            }
        });
        if(showError&&!found){
            let reply=Localisation.getTranslation("error.invalid.option");
            if(this.usage){
                reply+=`\n${Localisation.getTranslation("subCommand.usage", this.getUsage())}`;
            }
            message.reply(reply);
        }
        return found;
    }

    public abstract onRun(message : Message, args : string[]);

    public getUsage(){
        let text="";
        if(this.usage){
            this.usage.forEach((use, index)=>{
                if(use.required){
                    text+="<";
                }else{
                    text+="[";
                }
                text+=use.usages.map((value)=>Localisation.getTranslation(value)).join("/");
                if(use.required){
                    text+=">";
                }else{
                    text+="]";
                }
                if(index<this.usage.length-1)
                    text+=" ";
            });
        }
        return text;
    }
}

export enum CommandAvailability{
    DM,
    Guild,
    Both
}

export enum CommandAccess{
    Patreon,
    Moderators,
    GuildOwner,
    BotOwner
}

export class CommandUsage{
    public required : boolean;
    public usages : string[];

    public constructor(required : boolean, ...usages : string[]){
        this.required=required;
        this.usages=usages;
    }
}