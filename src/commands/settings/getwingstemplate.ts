import { GetWingsTemplateBaseCommand } from "../../baseCommands/settings/GetWingsTemplate";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class GetWingsTemplateCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new GetWingsTemplateBaseCommand();
    }
}

export = GetWingsTemplateCommand;