import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { Owner } from "../../structs/Category";
import { EmojisBaseCommand } from "../../baseCommands/guildSpecific/Emojis";

class EmojisCommand extends Command {
    public constructor() {
        super("Download emojis");
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new EmojisBaseCommand();
    }
}

export = EmojisCommand;