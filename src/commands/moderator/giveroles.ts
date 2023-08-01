import { GiveRolesBaseCommand } from "../../baseCommands/moderator/GiveRoles";
import { Moderator } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GiveRolesCommand extends Command {
    public constructor() {
        super();

        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.usage = [new CommandUsage(true, "argument.role")];
        this.category = Moderator;

        this.baseCommand = new GiveRolesBaseCommand();
    }
}

export = GiveRolesCommand;