import { Moderator } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { PatronBaseCommand } from "../../baseCommands/moderator/Patron";

class PatronCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.add", "argument.remove", "argument.list"), new CommandUsage(false, "argument.user")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.baseCommand = new PatronBaseCommand();
    }
}

export = PatronCommand;