import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ErrorStruct } from "../../structs/databaseTypes/ErrorStruct";
import { SubCommand } from "../../structs/SubCommand";
import { dateToString, getBotRoleColor, asyncForEach } from "../../Utils";

class CheckErrorCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.minArgs=1;
        this.category=Owner;
        this.usage=[new CommandUsage(true, "argument.errorid", "argument.clear", "argument.list", "argument.prune")];
        this.subCommands=[new ClearSubCommand(), new ListSubCommand(), new PruneSubCommand()];
    }

    public async onRun(cmdArgs : CommandArguments){
        const code=cmdArgs.args.shift().toLowerCase();
        if(!(await this.onRunSubCommands(cmdArgs, code, false))){
            const Errors=BotUser.getDatabase(DatabaseType.Errors);
            const error:ErrorStruct=await Errors.get(code);
            if(!error) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.errorCode"));
            cmdArgs.message.reply(Localisation.getTranslation("checkerror.error", dateToString(new Date(error.time), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}"), error.error));
        }
    }
}

class ClearSubCommand extends SubCommand{
    public constructor(){
        super("clear");
    }

    public async onRun(cmdArgs : CommandArguments){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);
        await Errors.clear();
        return cmdArgs.message.reply(Localisation.getTranslation("checkerror.clear"));
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(cmdArgs : CommandArguments){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);

        const errors:{key:string, value:ErrorStruct}[]=await Errors.entries();
        if(!errors||!errors.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.errors"));
        const data=[];
        errors.forEach(error=>{
            data.push(Localisation.getTranslation("checkerror.list", error.key, dateToString(new Date(error.value.time), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")));
        });
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        return cmdArgs.message.reply({embeds: [embed]});
    }
}

class PruneSubCommand extends SubCommand{
    public constructor(){
        super("prune");
    }

    public async onRun(cmdArgs : CommandArguments){
        const Errors=BotUser.getDatabase(DatabaseType.Errors);

        const errors:{key:string, value:ErrorStruct}[]=await Errors.entries();
        if(!errors||!errors.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.errors"));

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
        return cmdArgs.message.reply(Localisation.getTranslation("checkerror.prune"));
    }
}

export=CheckErrorCommand;