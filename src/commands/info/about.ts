import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { AboutBaseCommand } from "../../baseCommands/info/About";

class AboutCommand extends Command {
    public constructor() {
        super();
        this.category = Info;

        this.baseCommand = new AboutBaseCommand();
    }
}

export = AboutCommand;