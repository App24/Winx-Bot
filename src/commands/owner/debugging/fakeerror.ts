import { FakeErrorBaseCommand } from "../../../baseCommands/owner/Debugging/FakeError";
import { Owner } from "../../../structs/Category";
import { Command, CommandArguments } from "../../../structs/Command";
import { CommandAccess } from "../../../structs/CommandAccess";
import { reportError } from "../../../utils/Utils";

class FakeErrorCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;

        this.baseCommand = new FakeErrorBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     reportError("Test", cmdArgs.message);
    // }
}

export = FakeErrorCommand;