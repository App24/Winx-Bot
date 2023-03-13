import { SpookifyBaseCommand } from "../../baseCommands/misc/Spookify";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class SpookifyCommand extends Command {
    public constructor() {
        super();

        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.category = Settings;

        this.usage = [{ required: true, usages: ["start", "revert"] }];

        this.baseCommand = new SpookifyBaseCommand();
    }
}

export = SpookifyCommand;