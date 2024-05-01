import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { SlashCommand } from "../../../structs/SlashCommand";
import { WeeklyLeaderboardBaseCommand } from "../../../baseCommands/ranks/RecentLeaderboard";


class WeeklyLeaderboardCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Shows the weekly leaderboard!", type: ApplicationCommandType.ChatInput, options:
                [
                    {
                        name: "user",
                        description: "Mention user to see their position",
                        type: ApplicationCommandOptionType.User,
                    }
                ],
            dmPermission: false
        });

        this.baseCommand = new WeeklyLeaderboardBaseCommand();
    }
}

export = WeeklyLeaderboardCommand;