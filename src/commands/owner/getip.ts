import { GetIPBaseCommand } from "../../baseCommands/owner/GetIP";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class GetIpCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;

        this.baseCommand = new GetIPBaseCommand();
    }
}

export = GetIpCommand;