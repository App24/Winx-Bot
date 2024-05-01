import { Settings } from "../../../structs/Category";
import { Command } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { ManageGifsBaseCommand } from "../../../baseCommands/settings/ranks/ManageGifs";

class ManageGifsCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new ManageGifsBaseCommand();
    }
}

export = ManageGifsCommand;