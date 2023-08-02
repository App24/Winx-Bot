import { LevelPingBaseCommand } from "../../baseCommands/userSettings/LevelPing";
import { UserSettings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class LevelPingCommand extends Command {
    public constructor() {
        super();
        this.category = UserSettings;
        this.available = CommandAvailable.Guild;
        this.aliases = ["pinglevel"];

        this.baseCommand = new LevelPingBaseCommand();
    }
}

export = LevelPingCommand;