import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";
import { CustomCommandAddBaseCommand } from "../../baseCommands/customCommands/CustomCommandAdd";

class CustomCommandAddCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(true, "argument.name"), new CommandUsage(true, "argument.description"), new CommandUsage(true, "argument.outputs")];
        this.aliases = ["ccadd"];

        this.baseCommand = new CustomCommandAddBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
    //     const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

    //     const cmdName = cmdArgs.args.shift().toLowerCase();
    //     if (customCommands.find(c => c.name === cmdName) || (BotUser.getCommand(cmdName)))
    //         return cmdArgs.message.reply(Localisation.getTranslation("customcommand.error.command.exist"));

    //     const cmdDescription = cmdArgs.args.shift();
    //     const outputs = cmdArgs.args;

    //     const customCommand = new CustomCommand();
    //     customCommand.name = cmdName;
    //     customCommand.description = cmdDescription;
    //     customCommand.outputs = outputs;

    //     customCommands.push(customCommand);

    //     await CustomCommands.set(cmdArgs.guildId, customCommands);

    //     cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.add", cmdName));
    // }
}

export = CustomCommandAddCommand;