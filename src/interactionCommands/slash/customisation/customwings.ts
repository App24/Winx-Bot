import { ApplicationCommandType } from "discord.js";
import { CustomWingsBaseCommand } from "../../../baseCommands/customisation/CustomWings";
import { SlashCommand } from "../../../structs/SlashCommand";

class CustomWingsCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Set your custom wings", dmPermission: false, type: ApplicationCommandType.ChatInput });

        this.baseCommand = new CustomWingsBaseCommand();
    }
}

export = CustomWingsCommand;