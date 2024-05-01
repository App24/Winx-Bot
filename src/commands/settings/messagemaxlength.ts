import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { MessageMaxLengthBaseCommand } from "../../baseCommands/settings/MessageMaxLength";

class SetMaxLengthCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new MessageMaxLengthBaseCommand();
    }
}

export = SetMaxLengthCommand;