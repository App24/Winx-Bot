import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandRemoveBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const cmdName = cmdArgs.args[0].toLowerCase();
        const customCommand = await getOneDatabase(CustomCommand, { guildId: cmdArgs.guildId, name: cmdName });
        if (!customCommand) {
            return cmdArgs.reply("customcommand.error.command.not.exist");
        }

        await CustomCommand.deleteOne({ guildId: cmdArgs.guildId, name: cmdName });

        cmdArgs.reply("customcommand.success.remove");
    }
}