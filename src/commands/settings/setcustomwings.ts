import { SetCustomWingsBaseCommand } from "../../baseCommands/settings/SetCustomWings";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class CustomWingsCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new SetCustomWingsBaseCommand();
    }
}

export = CustomWingsCommand;