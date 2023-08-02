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
}

export = CustomCommandRemoveCommand;