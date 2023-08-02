import { ApplicationCommandType } from "discord.js";
import { RanksBaseCommand } from "../../../baseCommands/ranks/Ranks";
import { SlashCommand } from "../../../structs/SlashCommand";

class RanksCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Shows the transformations available!", type: ApplicationCommandType.ChatInput, dmPermission: false });

        this.baseCommand = new RanksBaseCommand();
    }
}

export = RanksCommand;