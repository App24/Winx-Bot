import { Owner } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { MessageUserBaseCommand } from "../../baseCommands/owner/MessageUser";

class MessageUserCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "argument.user"), new CommandUsage(true, "argument.message")];
        this.category = Owner;

        this.baseCommand = new MessageUserBaseCommand();
    }
}

export = MessageUserCommand;