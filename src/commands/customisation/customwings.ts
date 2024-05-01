import { CustomWingsBaseCommand } from "../../baseCommands/customisation/CustomWings";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class CustomWingsCommand extends Command {
    public constructor() {
        super();
        this.category = Customisation;

        this.baseCommand = new CustomWingsBaseCommand();
    }
}

export = CustomWingsCommand;