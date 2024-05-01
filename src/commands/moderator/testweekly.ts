import { Moderator } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { TestWeeklyBaseCommand } from "../../baseCommands/moderator/TestWeekly";

class TestWeeklyCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.baseCommand = new TestWeeklyBaseCommand();
    }
}

export = TestWeeklyCommand;