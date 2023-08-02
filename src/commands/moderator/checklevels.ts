import { Moderator } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CheckLevelsBaseCommand } from "../../baseCommands/moderator/CheckLevels";

class CheckLevelsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
        this.usage = [new CommandUsage(true, "argument.user")];
        this.category = Moderator;

        this.baseCommand = new CheckLevelsBaseCommand();
    }
}

export = CheckLevelsCommand;