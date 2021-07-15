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

    protected async onRunSubCommands(message : Message, subCommandName : string, args : string[], showError:boolean=true){
        let found=false;
        await asyncForEach(this.subCommands, async(subCommand : SubCommand)=>{
            if(subCommand.name.toLowerCase()===subCommandName.toLowerCase()||(subCommand.aliases&&subCommand.aliases.includes(subCommandName.toLowerCase()))){
                if(args.length<subCommand.minArgs){
                    message.reply(`You didn't provide enough arguments`);
                }else if(args.length>subCommand.maxArgs){
                    message.reply(`You provide too many arguments`);
                }else{
                    await subCommand.onRun(message, args);
                }
                found=true;
                return true;
            }
        });
        if(showError&&!found){
            let reply="That is not a valid option!";
            if(this.usage){
                reply+=`\nThe proper usage would be: \`${this.usage}\``;
            }
            message.reply(reply);
        }
        return found;
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