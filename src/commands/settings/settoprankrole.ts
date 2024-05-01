import { SetTopRankRoleBaseCommand } from "../../baseCommands/settings/SetTopRankRole";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class SetTopRankRoleCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new SetTopRankRoleBaseCommand();
    }
}

export = SetTopRankRoleCommand;