import { ApplicationCommandType } from "discord.js";
import { LevelsBaseCommand } from "../../../../baseCommands/ranks/Levels";
import { CommandAvailable } from "../../../../structs/CommandAvailable";
import { SlashCommand } from "../../../../structs/SlashCommand";

class LevelsCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.User, name: "Levels", dmPermission: false });

        this.deferEphemeral = true;

        this.available = CommandAvailable.Guild;

        this.baseCommand = new LevelsBaseCommand();
    }
}

export = LevelsCommand;