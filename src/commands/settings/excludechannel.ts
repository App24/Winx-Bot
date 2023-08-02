import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { ExcludeChannelBaseCommand } from "../../baseCommands/settings/ExcludeChannel";

class ExcludeChannelCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new ExcludeChannelBaseCommand();
    }
}

export = ExcludeChannelCommand;