import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CustomCommandRemoveBaseCommand } from "../../baseCommands/customCommands/CustomCommandRemove";

class CustomCommandRemoveCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(true, "argument.name")];
        this.aliases = ["ccremove"];

        this.baseCommand = new CustomCommandRemoveBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
    //     const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

    //     if (!customCommands.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.customcommands"));

    //     const cmdName = cmdArgs.args[0].toLowerCase();
    //     const customCommand = customCommands.find(c => c.name === cmdName);
    //     if (!customCommand) {
    //         return cmdArgs.message.reply(Localisation.getTranslation("customcommand.error.command.not.exist"));
    //     }
    //     const index = customCommands.findIndex(c => c === customCommand);
    //     customCommands.splice(index, 1);

    //     await CustomCommands.set(cmdArgs.guildId, customCommands);

    //     cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.remove"));
    // }
}

export = CustomCommandRemoveCommand;