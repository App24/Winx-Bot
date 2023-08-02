import { Moderator } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CheckLbLevelsBaseCommand } from "../../baseCommands/moderator/CheckLevels";

class CheckLBLevelsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
        this.category = Moderator;

        this.baseCommand = new CheckLbLevelsBaseCommand();
    }
}

export = CheckLBLevelsCommand;
