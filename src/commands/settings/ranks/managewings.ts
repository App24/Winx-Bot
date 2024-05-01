import { Settings } from "../../../structs/Category";
import { Command } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { ManageWingsBaseCommand } from "../../../baseCommands/settings/ranks/ManageWings";

class ManageWingsCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new ManageWingsBaseCommand();
    }
}

export = ManageWingsCommand;