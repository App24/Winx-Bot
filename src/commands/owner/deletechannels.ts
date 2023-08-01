import { CopyServerBaseCommand } from "../../baseCommands/owner/CopyServer";
import { DeleteChannelsBaseCommand } from "../../baseCommands/owner/DeleteChannels";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class DeleteChannelsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new CopyServerBaseCommand();
    }
}

//export = DeleteChannelsCommand;