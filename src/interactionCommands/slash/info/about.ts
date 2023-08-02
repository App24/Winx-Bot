import { ApplicationCommandType } from "discord.js";
import { AboutBaseCommand } from "../../../baseCommands/info/About";
import { SlashCommand } from "../../../structs/SlashCommand";

class AboutCommand extends SlashCommand {
    public constructor() {
        super({ name: "", type: ApplicationCommandType.ChatInput, description: "About the bot!" });

        this.baseCommand = new AboutBaseCommand();
    }
}

export = AboutCommand;