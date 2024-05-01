import { ListWingsRequestsBaseCommand } from "../../baseCommands/settings/ListWingsRequests";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class ListWingsRequestsCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new ListWingsRequestsBaseCommand();
    }
}

export = ListWingsRequestsCommand;