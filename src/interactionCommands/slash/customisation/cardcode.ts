import { ApplicationCommandType } from "discord.js";
import { CardCodeBaseCommand } from "../../../baseCommands/customisation/CardCode";
import { SlashCommand } from "../../../structs/SlashCommand";

class CardCodeCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Edit your level card", dmPermission: false, type: ApplicationCommandType.ChatInput });

        this.baseCommand = new CardCodeBaseCommand();
    }
}

export = CardCodeCommand;