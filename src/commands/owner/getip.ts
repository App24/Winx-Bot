import { GetIPBaseCommand } from "../../baseCommands/owner/GetIP";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GetIpCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new GetIPBaseCommand();
    }
}

export = GetIpCommand;