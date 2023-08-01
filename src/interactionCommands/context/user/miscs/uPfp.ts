import { ApplicationCommandType } from "discord.js";
import { PfpBaseCommand } from "../../../../baseCommands/misc/Pfp";
import { SlashCommand } from "../../../../structs/SlashCommand";

class PfpCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.User, name: "Profile Image" });

        this.baseCommand = new PfpBaseCommand();
    }
}

export = PfpCommand;