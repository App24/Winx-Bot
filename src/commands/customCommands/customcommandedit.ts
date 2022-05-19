import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getServerDatabase } from "../../utils/Utils";

class CustomCommandEditCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(true, "argument.name"), new CommandUsage(true, "argument.type"), new CommandUsage(true, "argument.value", "argument.oldvalue"), new CommandUsage(false, "argument.newvalue")];
        this.aliases = ["ccedit"];
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

        const type = cmdArgs.args[1].toLowerCase();
        let op: EditSettings;
        switch (type) {
            case "desc":
            case "description": {
                op = EditSettings.Description;
            } break;
            case "access": {
                op = EditSettings.Access;
            } break;
            case "message":
            case "out":
            case "output": {
                op = EditSettings.Output;
            } break;
            default: {
                return cmdArgs.message.reply(Localisation.getTranslation("customcommand.invalid.type"));
            } break;
        }

        const value = cmdArgs.args[2];
        switch (op) {
            case EditSettings.Description: {
                customCommand.description = value;
            } break;
            case EditSettings.Access: {
                let access: CommandAccess;
                switch (value.toLowerCase()) {
                    case "moderator": {
                        access = CommandAccess.Moderators;
                    } break;
                    case "owner": {
                        access = CommandAccess.GuildOwner;
                    } break;
                    case "creator":
                    case "botowner": {
                        access = CommandAccess.BotOwner;
                    } break;
                    case "patreon": {
                        access = CommandAccess.Patreon;
                    } break;
                    case "booster": {
                        access = CommandAccess.Booster;
                    } break;
                    default: {
                        return cmdArgs.message.reply(Localisation.getTranslation("customcommand.invalid.access"));
                    } break;
                }
                customCommand.access = access;
            } break;
            case EditSettings.Output: {
                if (cmdArgs.args[3]) {
                    const index = customCommand.outputs.findIndex(output => output.toLowerCase() === value.toLowerCase());
                    if (index > -1) {
                        customCommand.outputs[index] = cmdArgs.args[3];
                    } else
                        return cmdArgs.message.reply(Localisation.getTranslation("customcommand.undefined.output"));
                } else {
                    const index = customCommand.outputs.findIndex(output => output.toLowerCase() === value.toLowerCase());
                    if (index > -1) {
                        customCommand.outputs.splice(index, 1);
                        cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.output.remove"));
                    } else {
                        customCommand.outputs.push(value);
                        cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.output.add"));
                    }
                }
            } break;
        }
        await CustomCommands.set(cmdArgs.guildId, customCommands);
        cmdArgs.message.reply(Localisation.getTranslation("customcommand.success.edit"));
    }
}

enum EditSettings {
    Description,
    Access,
    Output
}

export = CustomCommandEditCommand;