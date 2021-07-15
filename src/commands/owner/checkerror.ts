import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ErrorStruct } from "../../structs/databaseTypes/ErrorStruct";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getStringTime } from "../../Utils";

class CheckErrorCommand extends Command{
    public constructor(){
        super("Checks logged errors");
        this.access=CommandAccess.BotOwner;
        this.minArgs=1;
        this.category=Owner;
        this.usage="<error id/clear/list/prune>";
        this.subCommands=[new ClearSubCommand(), new ListSubCommand(), new PruneSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        const code=args.shift().toLowerCase();
        if(!(await this.onRunSubCommands(message, code, args, false))){
            const Errors=BotUser.getDatabase(DatabaseType.Errors);
            const error:ErrorStruct=await Errors.get(code);
                if(!error) return message.reply("That is not a valid error code!");
                message.channel.send(`${getStringTime(error.time)}\n\`\`\`${error.error}\`\`\``);
        }
    }
}

class ClearSubCommand extends SubCommand{
    public constructor(){
        super("clear");
    }

    public async onRun(message : Message, args : string[]){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);
        await Errors.clear();
        return message.channel.send("Cleared all errors!");
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);

        const errors:{key:string, value:ErrorStruct}[]=await Errors.entries();
        if(!errors||!errors.length) return message.reply("There are no errors!");
        const data=[];
        errors.forEach(error=>{
            data.push(`**${error.key}**: ${getStringTime(error.value.time)}`);
        });
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        return message.channel.send(embed);
    }
}

class PruneSubCommand extends SubCommand{
    public constructor(){
        super("prune");
    }

    public async onRun(message : Message, args : string[]){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);

        const errors:{key:string, value:ErrorStruct}[]=await Errors.entries();
        if(!errors||!errors.length) return message.reply("There are no errors!");

        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerWeek = msPerDay * 7;
        const currentTime=new Date().getTime();
        await asyncForEach(errors, async(error : {key:string, value:ErrorStruct})=>{
            if(currentTime-error.value.time>msPerWeek*2){
                await Errors.delete(error.key);
            }
        });
        return message.channel.send("Pruned 2+ week old errors!");
    }
}

export=CheckErrorCommand;