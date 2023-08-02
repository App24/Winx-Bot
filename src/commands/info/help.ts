import { Info } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { HelpBaseCommand } from "../../baseCommands/info/Help";

class HelpCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(false, "argument.category")];
        this.category = Info;

        this.baseCommand = new HelpBaseCommand();
    }
}

export = HelpCommand;