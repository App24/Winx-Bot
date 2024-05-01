import { GiveXPBaseCommand } from "../../baseCommands/misc/GiveXp";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GiveXPCommand extends Command {
    constructor() {
        super();
        this.cooldown = 60 * 5;

        this.baseCommand = new GiveXPBaseCommand();
    }
}

export = GiveXPCommand;