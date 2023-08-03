import { WeeklyLeaderboardBaseCommand } from "../../baseCommands/ranks/RecentLeaderboard";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class RankCommand extends Command {
    public constructor() {
        super();
        this.category = Rank;
        this.usage = [new CommandUsage(false, "argument.user")];
        this.aliases = ["wrank", "wlb"];
        this.available = CommandAvailable.Guild;

        this.baseCommand = new WeeklyLeaderboardBaseCommand();
    }
}

export = RankCommand;