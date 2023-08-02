import { GeTWingsTemplateBaseCommand } from "../../baseCommands/settings/GetWingsTemplate";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GetWingsTemplateCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;

        this.baseCommand = new GeTWingsTemplateBaseCommand();
    }
}

export = GetWingsTemplateCommand;