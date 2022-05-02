import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";

class CustomCommandRemoveCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(true, "argument.name")];
        this.aliases = ["ccremove"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

        if (!customCommands.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.customcommands"));

        const cmdName = cmdArgs.args[0].toLowerCase();
        const customCommand = customCommands.find(c => c.name === cmdName);
        if (!customCommand) {
            return cmdArgs.message.reply(Localisation.getTranslation("customcommand.error.command.not.exist"));
        }
        const index = customCommands.findIndex(c => c === customCommand);
        customCommands.splice(index, 1);

        await CustomCommands.set(cmdArgs.guildId, customCommands);

        cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.remove"));
    }
}

export = CustomCommandRemoveCommand;