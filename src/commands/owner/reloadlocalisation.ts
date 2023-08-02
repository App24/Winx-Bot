import { ReloadLocalisationBaseCommand } from "../../baseCommands/owner/ReloadLocalisation";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class ReloadLocalisationCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;
        this.aliases = ["reloadlocal", "relocal"];

        this.baseCommand = new ReloadLocalisationBaseCommand();
    }
}

export = ReloadLocalisationCommand;