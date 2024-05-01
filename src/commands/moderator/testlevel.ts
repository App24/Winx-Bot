import { Moderator } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { TestLevelBaseCommand } from "../../baseCommands/moderator/TestLevel";

class TestLevelCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level")];
        this.baseCommand = new TestLevelBaseCommand();
    }
}

export = TestLevelCommand;