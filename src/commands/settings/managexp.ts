import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { ManageXpBaseCommand } from "../../baseCommands/settings/ManageXp";

class SetXPCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new ManageXpBaseCommand();
    }
}

export = SetXPCommand;