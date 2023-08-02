import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { LevelsBaseCommand } from "../../../baseCommands/ranks/Levels";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { SlashCommand } from "../../../structs/SlashCommand";

class LevelsCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Show your level!", type: ApplicationCommandType.ChatInput, options:
                [
                    {
                        name: "user",
                        description: "Mention user to see their levels",
                        type: ApplicationCommandOptionType.User
                    }
                ],
            dmPermission: false
        });

        this.available = CommandAvailable.Guild;

        this.baseCommand = new LevelsBaseCommand();
    }
}

export = LevelsCommand;