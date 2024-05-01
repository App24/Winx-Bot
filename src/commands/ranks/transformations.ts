import { RanksBaseCommand } from "../../baseCommands/ranks/Ranks";
import { Rank } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class RanksCommand extends Command {
    public constructor() {
        super();
        this.category = Rank;
        this.aliases = ["ranks"];

        this.baseCommand = new RanksBaseCommand();
    }
}

export = RanksCommand;