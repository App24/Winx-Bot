import { Info } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { ContactCreatorBaseCommand } from "../../baseCommands/info/ContactCreator";

class ContactCreatorCommand extends Command {
    public constructor() {
        super();
        this.category = Info;
        this.usage = [new CommandUsage(true, "argument.message")];

        this.baseCommand = new ContactCreatorBaseCommand();
    }
}

export = ContactCreatorCommand;