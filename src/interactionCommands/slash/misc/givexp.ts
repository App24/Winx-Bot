import { ApplicationCommandType } from "discord.js";
import { GiveXPBaseCommand } from "../../../baseCommands/misc/GiveXp";
import { SlashCommand } from "../../../structs/SlashCommand";

class GiveXpSlashCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Gives you free xp", dmPermission: false, type: ApplicationCommandType.ChatInput });

        this.baseCommand = new GiveXPBaseCommand();

        this.cooldown = 5 * 60;
    }
}

export = GiveXpSlashCommand;