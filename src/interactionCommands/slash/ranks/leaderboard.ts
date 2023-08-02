import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { LeaderboardBaseCommand } from "../../../baseCommands/ranks/Leaderboard";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { SlashCommand } from "../../../structs/SlashCommand";


class LeaderboardCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Shows the leaderboard!", type: ApplicationCommandType.ChatInput, options:
                [
                    {
                        name: "user",
                        description: "Mention user to see their position",
                        type: ApplicationCommandOptionType.User,
                    }
                ],
            dmPermission: false
        });

        this.available = CommandAvailable.Guild;

        this.baseCommand = new LeaderboardBaseCommand();
    }
}

export = LeaderboardCommand;