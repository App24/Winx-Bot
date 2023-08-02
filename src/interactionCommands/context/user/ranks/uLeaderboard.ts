import { ApplicationCommandType } from "discord.js";
import { LeaderboardBaseCommand as LeaderboardBaseCommand } from "../../../../baseCommands/ranks/Leaderboard";
import { CommandAvailable } from "../../../../structs/CommandAvailable";
import { SlashCommand } from "../../../../structs/SlashCommand";

class LeaderboardCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.User, name: "Leaderboard", dmPermission: false });

        this.deferEphemeral = true;

        this.available = CommandAvailable.Guild;

        this.baseCommand = new LeaderboardBaseCommand();
    }
}

export = LeaderboardCommand;