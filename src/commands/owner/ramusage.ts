import { RamUsageBaseCommand } from "../../baseCommands/owner/RamUsage";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class RamUsageCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;

        this.baseCommand = new RamUsageBaseCommand();
    }
}

export = RamUsageCommand;