import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandRemoveBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

        if (!customCommands.length) return cmdArgs.reply("error.empty.customcommands");

        const cmdName = cmdArgs.args[0].toLowerCase();
        const customCommand = customCommands.find(c => c.name === cmdName);
        if (!customCommand) {
            return cmdArgs.reply("customcommand.error.command.not.exist");
        }
        const index = customCommands.findIndex(c => c === customCommand);
        customCommands.splice(index, 1);

        await CustomCommands.set(cmdArgs.guildId, customCommands);

        cmdArgs.reply("customcommand.success.remove");
    }
}