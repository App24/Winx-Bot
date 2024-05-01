import { Rank } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { LeaderboardBaseCommand } from "../../baseCommands/ranks/Leaderboard";

class RankCommand extends Command {
    public constructor() {
        super();
        this.category = Rank;
        this.usage = [new CommandUsage(false, "argument.user")];
        this.aliases = ["rank", "lb"];

        this.baseCommand = new LeaderboardBaseCommand();
    }
}

export = RankCommand;