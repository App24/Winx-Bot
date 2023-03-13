import { ApplicationCommandType } from "discord.js";
import { CardWebsiteBaseCommand } from "../../../baseCommands/info/CardWebsite";
import { SlashCommand } from "../../../structs/SlashCommand";

class CardWebsiteSlashCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Get website to edit your level card", type: ApplicationCommandType.ChatInput });

        this.baseCommand = new CardWebsiteBaseCommand();
    }
}

export = CardWebsiteSlashCommand;