import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CustomCommandListBaseCommand } from "../../baseCommands/customCommands/CustomCommandList";

class CustomCommandListCommand extends Command {
    public constructor() {
        super();
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(false, "argument.name")];
        this.aliases = ["cclist"];

        this.baseCommand = new CustomCommandListBaseCommand();
    }
}

export = CustomCommandListCommand;