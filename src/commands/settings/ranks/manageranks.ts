import { Settings } from "../../../structs/Category";
import { Command } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { ManageRanksBaseCommand } from "../../../baseCommands/settings/ranks/ManageRanks";

class ManageRanksCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new ManageRanksBaseCommand();
    }
}

export = ManageRanksCommand;