import { Moderator } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { ResetWeeklyLeaderboardBaseCommand } from "../../baseCommands/moderator/ResetWeeklyLeaderboard";

class ResetWeeklyCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new ResetWeeklyLeaderboardBaseCommand();
    }
}

export = ResetWeeklyCommand;