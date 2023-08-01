import { PfpBaseCommand } from "../../baseCommands/misc/Pfp";
import { Command, CommandUsage } from "../../structs/Command";

class PfpCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(false, "argument.user")];

        this.baseCommand = new PfpBaseCommand();
    }
}

export = PfpCommand;