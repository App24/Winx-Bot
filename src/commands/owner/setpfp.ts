import { SetPfpBaseCommand } from "../../baseCommands/owner/SetPfp";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class SetPFPCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;

        this.baseCommand = new SetPfpBaseCommand();
    }
}

export = SetPFPCommand;