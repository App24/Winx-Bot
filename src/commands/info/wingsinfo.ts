import { WingsInfoBaseCommand } from "../../baseCommands/info/WingsInfo";
import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";

class WingsInfoCommand extends Command {
    public constructor() {
        super();

        this.category = Info;

        this.baseCommand = new WingsInfoBaseCommand();
    }
}

export = WingsInfoCommand;