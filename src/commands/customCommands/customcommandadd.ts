import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";

class CustomCommandAddCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
        this.category=CustomCommandsSettings;
        this.minArgs=3;
        this.usage=[new CommandUsage(true, "argument.name"), new CommandUsage(true, "argument.description"), new CommandUsage(true, "argument.outputs")];
        this.aliases=["ccadd"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const CustomCommands=BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands=await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guild.id);

        const cmdName=cmdArgs.args.shift().toLowerCase();
        if(customCommands.find(c=>c.name===cmdName)||(BotUser.getCommand(cmdName)))
            return cmdArgs.message.reply(Localisation.getTranslation("customcommand.error.command.exist"));

        const cmdDescription=cmdArgs.args.shift();
        const outputs=cmdArgs.args;

        const customCommand=new CustomCommand();
        customCommand.name=cmdName;
        customCommand.description=cmdDescription;
        customCommand.outputs=outputs;

        customCommands.push(customCommand);

        await CustomCommands.set(cmdArgs.guild.id, customCommands);

        cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.add", cmdName));
    }
}

export=CustomCommandAddCommand;