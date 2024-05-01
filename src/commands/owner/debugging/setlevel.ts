import { Owner } from "../../../structs/Category";
import { Command, CommandUsage } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { SetLevelBaseCommand } from "../../../baseCommands/owner/Debugging/SetLevel";

class SetLevelCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "argument.xp")];

        this.baseCommand = new SetLevelBaseCommand();
    }
}

export = SetLevelCommand;