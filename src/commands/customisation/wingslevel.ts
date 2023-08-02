import { WingsLevelBaseCommand } from "../../baseCommands/customisation/WingsLevel";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class WingsLevelCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["wingslevels", "wingselect", "wingsselect"];

        this.baseCommand = new WingsLevelBaseCommand();
    }
}

export = WingsLevelCommand;