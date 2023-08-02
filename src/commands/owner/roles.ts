import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { RolesBaseCommand } from "../../baseCommands/owner/Roles";

class RolesCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.available = CommandAvailable.Guild;
        this.category = Owner;
        this.deprecated = true;

        this.baseCommand = new RolesBaseCommand();
    }
}

export = RolesCommand;