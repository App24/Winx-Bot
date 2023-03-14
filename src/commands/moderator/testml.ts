import { Moderator } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { TestMlBaseCommand } from "../../baseCommands/moderator/TestMl";

class TestMLCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "all")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.baseCommand = new TestMlBaseCommand();
    }
}

export = TestMLCommand;