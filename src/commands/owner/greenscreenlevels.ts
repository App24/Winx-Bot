import { GreenScreenLevelsBaseCommand } from "../../baseCommands/ranks/Levels";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GreenScreenLevelsCommand extends Command {
    public constructor() {
        super();

        this.category = Owner;

        this.baseCommand = new GreenScreenLevelsBaseCommand();
    }
}

export = GreenScreenLevelsCommand;