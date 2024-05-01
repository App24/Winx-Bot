import { BotUser } from "../../BotClient";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandAddBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const customCommands = await getDatabase(CustomCommand, { guildId: cmdArgs.guildId });

        const cmdName = cmdArgs.args.shift().toLowerCase();
        if (customCommands.find(c => c.document.name === cmdName) || (BotUser.getCommand(cmdName)))
            return cmdArgs.reply("customcommand.error.command.exist");

        const cmdDescription = cmdArgs.args.shift();
        const outputs = cmdArgs.args;

        const customCommand = new CustomCommand({ guildId: cmdArgs.guildId, name: cmdName, description: cmdDescription, outputs, access: CommandAccess.Everyone });

        await customCommand.save();

        cmdArgs.reply("customcommand.success.add", cmdName);
    }
}