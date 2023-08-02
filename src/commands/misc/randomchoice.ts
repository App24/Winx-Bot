import { RandomChoiceBaseCommand } from "../../baseCommands/misc/RandomChoice";
import { Command, CommandUsage } from "../../structs/Command";

class RandomChoiceCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "choice1"), new CommandUsage(true, "choice2"), new CommandUsage(false, "choice3...")];

        this.baseCommand = new RandomChoiceBaseCommand();
    }
}

export = RandomChoiceCommand;