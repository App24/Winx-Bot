import { Message } from "discord.js";
import { asyncForEach } from "../Utils";
import { Category, Other } from "./Category";
import { SubCommand } from "./SubCommand";

export abstract class Command{
    public enabled : boolean;
    public deprecated : boolean;
    public hidden : boolean;

    public category : Category;

    public description : string;
    public usage : string;

    public availability : CommandAvailability;
    public access : CommandAccess;

    public aliases : string[];

    public minArgs : number;
    public maxArgs : number;

    public cooldown : number;

    public guildIds : string[];

    public subCommands : SubCommand[];

    public constructor(description : string){
        this.description=description;
        this.enabled=true;
        this.category=Other;
        this.availability=CommandAvailability.Both;
        this.minArgs=0;
        this.maxArgs=Number.MAX_SAFE_INTEGER;
        this.subCommands=[];
    }

    protected async onRunSubCommands(message : Message, name : string, args : string[], showError:boolean=false){
        let ran=false;
        await asyncForEach(this.subCommands, async(subCommand : SubCommand)=>{
            if(subCommand.name.toLowerCase()===name.toLowerCase()||(subCommand.aliases&&subCommand.aliases.includes(name.toLowerCase()))){
                if(args.length<subCommand.minArgs){
                    return message.reply(`You didn't provide enough arguments`);
                }else if(args.length>subCommand.maxArgs){
                    return message.reply(`You provide too many arguments`);
                }
                await subCommand.onRun(message, args);
                ran=true;
                return true;
            }
        });
        if(showError&&!ran){
            message.reply("That is not a valid option!");
        }
        return ran;
    }

    public abstract onRun(message : Message, args : string[]);
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