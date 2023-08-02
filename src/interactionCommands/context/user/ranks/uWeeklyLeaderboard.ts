import { ApplicationCommandType } from "discord.js";
import { CommandAvailable } from "../../../../structs/CommandAvailable";
import { SlashCommand } from "../../../../structs/SlashCommand";
import { WeeklyLeaderboardBaseCommand } from "../../../../baseCommands/ranks/RecentLeaderboard";

class WeeklyLeaderboardCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.User, name: "Weekly Leaderboard", dmPermission: false });

        this.deferEphemeral = true;

        this.available = CommandAvailable.Guild;

        this.baseCommand = new WeeklyLeaderboardBaseCommand();
    }
}

export = WeeklyLeaderboardCommand;