import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { PfpBaseCommand } from "../../../baseCommands/misc/Pfp";
import { SlashCommand } from "../../../structs/SlashCommand";

class PfpCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Get a user's profile image!", type: ApplicationCommandType.ChatInput, options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "User",
                    required: false
                }
            ]
        });

        this.baseCommand = new PfpBaseCommand();
    }
}

export = PfpCommand;