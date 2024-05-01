import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { MessageMaxBaseCommand } from "../../baseCommands/settings/MessageMax";

class SetMaxMessageCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;

        this.baseCommand = new MessageMaxBaseCommand();
    }
}

export = SetMaxMessageCommand;