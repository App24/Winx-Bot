import { ApplicationCommandType } from "discord.js";
import { CardSlotsBaseCommand } from "../../../baseCommands/customisation/CardSlots";
import { SlashCommand } from "../../../structs/SlashCommand";

class CardSlotsCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Save your current card into a slot to easily switch to it", dmPermission: false, type: ApplicationCommandType.ChatInput });

        this.baseCommand = new CardSlotsBaseCommand();
    }
}

export = CardSlotsCommand;