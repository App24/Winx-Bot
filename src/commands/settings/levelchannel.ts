import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { LevelChannelBaseCommand } from "../../baseCommands/settings/LevelChannel";

class LevelChannelCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new LevelChannelBaseCommand();
    }
}

export = LevelChannelCommand;