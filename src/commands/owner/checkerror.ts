import { CheckErrorBaseCommand } from "../../baseCommands/owner/CheckError";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class CheckErrorCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new CheckErrorBaseCommand();
    }
}

export = CheckErrorCommand;