import { BotUser } from "../../BotClient";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandAddBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

        const cmdName = cmdArgs.args.shift().toLowerCase();
        if (customCommands.find(c => c.name === cmdName) || (BotUser.getCommand(cmdName)))
            return cmdArgs.reply("customcommand.error.command.exist");

        const cmdDescription = cmdArgs.args.shift();
        const outputs = cmdArgs.args;

        const customCommand = new CustomCommand();
        customCommand.name = cmdName;
        customCommand.description = cmdDescription;
        customCommand.outputs = outputs;
        customCommand.access = CommandAccess.None;

        customCommands.push(customCommand);

        await CustomCommands.set(cmdArgs.guildId, customCommands);

        cmdArgs.reply("customcommand.success.add", cmdName);
    }
}