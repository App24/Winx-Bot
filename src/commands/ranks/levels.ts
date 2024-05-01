import { Rank } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { LevelsBaseCommand } from "../../baseCommands/ranks/Levels";

class LevelsCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(false, "argument.user")];
        this.category = Rank;
        this.aliases = ["ml", "magiclevels"];

        this.baseCommand = new LevelsBaseCommand();
    }
}

export = LevelsCommand;