import { ApplicationCommandType } from "discord.js";
import { CustomWingsBaseCommand } from "../../../baseCommands/customisation/CustomWings";
import { SlashCommand } from "../../../structs/SlashCommand";
import { CommandAccess } from "../../../structs/CommandAccess";

class CustomWingsCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Set your custom wings", dmPermission: false, type: ApplicationCommandType.ChatInput });

        this.access = CommandAccess.PatreonOrBooster;

        this.baseCommand = new CustomWingsBaseCommand();
    }
}

export = CustomWingsCommand;