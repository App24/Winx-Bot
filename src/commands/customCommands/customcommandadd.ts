import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CustomCommandAddBaseCommand } from "../../baseCommands/customCommands/CustomCommandAdd";

class CustomCommandAddCommand extends Command {
    public constructor() {
        super();
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(true, "argument.name"), new CommandUsage(true, "argument.description"), new CommandUsage(true, "argument.outputs")];
        this.aliases = ["ccadd"];

        this.baseCommand = new CustomCommandAddBaseCommand();
    }
}

export = CustomCommandAddCommand;