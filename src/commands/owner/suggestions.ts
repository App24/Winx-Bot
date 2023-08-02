import { Owner } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { SuggestionsBaseCommand } from "../../baseCommands/owner/Suggestions";

class SuggestionsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.usage = [new CommandUsage(true, "argument.list", "argument.complete", "argument.reject", "argument.get"), new CommandUsage(false, "argument.requestid", "argument.rejected", "argument.completed", "argument.non")];
        this.category = Owner;

        this.baseCommand = new SuggestionsBaseCommand();
    }
}

export = SuggestionsCommand;