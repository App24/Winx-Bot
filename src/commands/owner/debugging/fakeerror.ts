import { Owner } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../../structs/Command";
import { reportError } from "../../../utils/Utils";

class FakeErrorCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        reportError("Test", cmdArgs.message);
    }
}

export = FakeErrorCommand;