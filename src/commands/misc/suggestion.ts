import { Command, CommandUsage } from "../../structs/Command";
import { SuggestBaseCommand } from "../../baseCommands/misc/Suggest";

class SuggestionCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "argument.suggestion")];
        this.aliases = ["suggest"];

        this.baseCommand = new SuggestBaseCommand();
    }
}

export = SuggestionCommand;