import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { MessageMinLengthBaseCommand } from "../../baseCommands/settings/MessageMinLength";

class SetMinLengthCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new MessageMinLengthBaseCommand();
    }
}

export = SetMinLengthCommand;